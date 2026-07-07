export class ApiError extends Error {
  readonly status: number;
  readonly url: string;
  readonly body?: unknown;

  constructor(message: string, status: number, url: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
    this.body = body;
  }
}
