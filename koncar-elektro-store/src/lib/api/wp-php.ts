import dns from 'node:dns';
import { serverWpOrigin } from '@/lib/api/server-config';

dns.setDefaultResultOrder('ipv4first');

export class WpPhpError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'WpPhpError';
    this.status = status;
    this.code = code;
  }
}

type WpPhpFile = 'contact.php' | 'koncar-auth.php';

export async function postWpPhp<T>(file: WpPhpFile, body: unknown): Promise<T> {
  const url = `${serverWpOrigin}/${file}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
  } catch {
    throw new WpPhpError(
      'WordPress trenutno nije dostupan. Pokušajte ponovo.',
      502,
      'wp_unreachable',
    );
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (response.status === 404 || (!data && text.trim().startsWith('<'))) {
    throw new WpPhpError(
      `Fajl ${file} nije postavljen u WordPress root. Upload-ujte ga pa pokušajte ponovo.`,
      503,
      'php_missing',
    );
  }

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message?: unknown }).message)
        : `WordPress greška (${response.status}).`;
    throw new WpPhpError(message, response.status >= 400 ? response.status : 502, 'wp_php_error');
  }

  return data as T;
}
