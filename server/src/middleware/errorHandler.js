import { log } from '../lib/log.js';
export function errorHandler(err, req, res, _next) {
  const status = Number(err.status) || 500;
  if (status >= 500) log.error('request.failed',{path:req.path,message:err.message,stack:err.stack});
  res.status(status).json({ error:{ code:err.code ?? 'INTERNAL', message:status >= 500 && !err.code ? 'Something went wrong.' : err.message, details:err.details ?? undefined } });
}

