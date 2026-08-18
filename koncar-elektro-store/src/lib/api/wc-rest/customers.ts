import { wcV3Fetch, WcRestError } from '@/lib/api/wc-rest/client';

export type WcCustomer = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  billing?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
};

export type CreateWcCustomerInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

function usernameFromEmail(email: string): string {
  const local = email.split('@')[0]?.replace(/[^a-zA-Z0-9._-]/g, '') || 'kupac';
  return `${local}.${Date.now().toString(36)}`.slice(0, 60);
}

export async function createWcCustomer(input: CreateWcCustomerInput): Promise<WcCustomer> {
  return wcV3Fetch<WcCustomer>('/customers', {
    method: 'POST',
    body: JSON.stringify({
      email: input.email,
      username: usernameFromEmail(input.email),
      password: input.password,
      first_name: input.firstName,
      last_name: input.lastName,
      billing: {
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        phone: input.phone ?? '',
      },
    }),
  });
}

export function isExistingCustomerError(error: unknown): boolean {
  if (!(error instanceof WcRestError)) return false;
  const code = (error.code ?? '').toLowerCase();
  const message = error.message.toLowerCase();
  return (
    code.includes('email-exists') ||
    code.includes('already_registered') ||
    message.includes('already registered') ||
    message.includes('već postoji') ||
    message.includes('vec postoji')
  );
}
