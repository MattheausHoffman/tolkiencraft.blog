export class HttpError extends Error {
  constructor(status, message, errors = null) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.errors = errors;
  }
}
