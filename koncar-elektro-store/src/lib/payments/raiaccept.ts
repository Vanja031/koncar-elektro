/**
 * Server-only RaiAccept (Raiffeisen) payment gateway client.
 *
 * Implements the "Code integration" REST API from docs.raiaccept.com —
 * the officially supported path for custom/headless platforms (as opposed to
 * the WooCommerce plugin, which hooks into WooCommerce's native checkout page
 * that this headless site does not use).
 *
 * Flow: Authenticate → Create order entry → Create payment session (redirect).
 * Never import this from a client component — credentials are server-only.
 */

const AUTH_URL = 'https://authenticate.raiaccept.com';
const API_BASE = 'https://trapi.raiaccept.com';

// Documented as a fixed public value in docs.raiaccept.com/code-integration.html
// (same Cognito app client for both Sandbox and Production — the environment
// is determined by which username/password pair you authenticate with).
const DEFAULT_CLIENT_ID = 'kr2gs4117arvbnaperqff5dml';

export class RaiAcceptError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'RaiAcceptError';
    this.status = status;
    this.body = body;
  }
}

export type RaiAcceptAddress = {
  firstName?: string;
  lastName?: string;
  addressStreet1?: string;
  addressStreet2?: string;
  addressStreet3?: string;
  city?: string;
  postalCode?: string;
  country?: string; // ISO 3166-1 alpha-3
  state?: string;
};

export type RaiAcceptConsumer = {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobilePhone?: string;
  phone?: string;
  workPhone?: string;
  ipAddress?: string;
};

export type RaiAcceptInvoiceItem = {
  description?: string;
  numberOfItems: number;
  price: number;
};

export type CreateOrderEntryInput = {
  consumer: RaiAcceptConsumer;
  billingAddress: RaiAcceptAddress;
  shippingAddress: RaiAcceptAddress;
  invoice: {
    amount: number;
    currency: string;
    description?: string;
    merchantOrderReference: string;
    items: RaiAcceptInvoiceItem[];
  };
  urls: {
    successUrl: string;
    cancelUrl: string;
    failUrl: string;
    notificationUrl?: string;
  };
};

export type RaiAcceptOrderEntryResult = CreateOrderEntryInput & {
  orderIdentification: string;
  paymentMethodPreference: 'CARD';
  merchant: { merchantAccountId: string; statementDescriptorShortVersion: string };
  isProduction: boolean;
  createdOn: string;
};

export type RaiAcceptPaymentSessionResult = {
  sessionId: string;
  paymentRedirectURL: string;
  isProduction?: boolean;
};

export type RaiAcceptOrderStatus =
  | 'DRAFT'
  | 'CHECKOUT'
  | 'PAID'
  | 'PARTIALLY_REFUNDED'
  | 'FULLY_REFUNDED'
  | 'FAILED'
  | 'CANCELED'
  | 'ABANDONED';

export type RaiAcceptOrderDetails = RaiAcceptOrderEntryResult & {
  status: RaiAcceptOrderStatus;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name} (RaiAccept integration not configured)`);
  }
  return value;
}

type CachedToken = { idToken: string; expiresAt: number };
let cachedToken: CachedToken | null = null;

/**
 * Authenticate against Amazon Cognito with the RaiAccept API credentials.
 * Token is cached in-process for a few minutes to avoid a round trip on every
 * request within the same serverless invocation/warm lambda.
 */
async function authenticate(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.idToken;
  }

  const username = requireEnv('RAIACCEPT_USERNAME');
  const password = requireEnv('RAIACCEPT_PASSWORD');
  const clientId = process.env.RAIACCEPT_CLIENT_ID || DEFAULT_CLIENT_ID;

  const response = await fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
    },
    body: JSON.stringify({
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: { USERNAME: username, PASSWORD: password },
      ClientId: clientId,
    }),
    cache: 'no-store',
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new RaiAcceptError(
      (body && (body.message || body.__type)) || `RaiAccept auth failed (${response.status})`,
      response.status,
      body,
    );
  }

  const idToken: string | undefined = body?.AuthenticationResult?.IdToken ?? body?.IdToken;
  if (!idToken) {
    throw new RaiAcceptError('RaiAccept auth response missing IdToken', 502, body);
  }

  // Cache conservatively (5 min) — well under typical Cognito token TTL.
  cachedToken = { idToken, expiresAt: Date.now() + 5 * 60 * 1000 };
  return idToken;
}

async function raiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const idToken = await authenticate();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
      ...init.headers,
    },
    cache: 'no-store',
  });

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message =
      (body && typeof body === 'object' && 'message' in (body as Record<string, unknown>)
        ? String((body as Record<string, unknown>).message)
        : null) || `RaiAccept API ${response.status}`;
    throw new RaiAcceptError(message, response.status, body);
  }

  return body as T;
}

/** Step 2: create the order database entry in RaiAccept, returns `orderIdentification`. */
export async function createOrderEntry(
  input: CreateOrderEntryInput,
): Promise<RaiAcceptOrderEntryResult> {
  return raiFetch<RaiAcceptOrderEntryResult>('/orders', {
    method: 'POST',
    body: JSON.stringify({ ...input, paymentMethodPreference: 'CARD' }),
  });
}

/** Step 3: create the payment form session — use the SAME input as step 2. */
export async function createPaymentSession(
  orderIdentification: string,
  input: CreateOrderEntryInput,
): Promise<RaiAcceptPaymentSessionResult> {
  return raiFetch<RaiAcceptPaymentSessionResult>(`/orders/${orderIdentification}/checkout`, {
    method: 'POST',
    body: JSON.stringify({ ...input, paymentMethodPreference: 'CARD' }),
  });
}

/** Optional: authoritative status check — always call this before trusting a redirect or webhook. */
export async function getOrderDetails(orderIdentification: string): Promise<RaiAcceptOrderDetails> {
  return raiFetch<RaiAcceptOrderDetails>(`/orders/${orderIdentification}`, { method: 'GET' });
}
