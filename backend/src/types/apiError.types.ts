export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message ?? "An error occurred");
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
