export class AppError extends Error {
  constructor(code, message, status = 500, details) { super(message); this.name = 'AppError'; this.code = code; this.status = status; this.details = details; }
}
export const badRequest = (message, details) => new AppError('BAD_REQUEST', message, 400, details);
export const notFound = (message = 'Not found') => new AppError('NOT_FOUND', message, 404);
export const unauthenticated = () => new AppError('UNAUTHENTICATED', 'Please sign in.', 401);

