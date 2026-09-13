export type ApiErrorBody = {
  detail?: string;
  message?: string;
  error?: string;
};


export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;
  readonly details: Record<string, unknown>;

  constructor(
    status: number,
    body: unknown,
    message: string,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.body = body;

    this.details =
      body &&
      typeof body === "object" &&
      !Array.isArray(body)
        ? (body as Record<string, unknown>)
        : {};

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
