import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { unauthenticated } from '../lib/errors.js';
export function requireAuth(req,_res,next){
  try { const token=req.cookies?.proofpay; if(!token) throw unauthenticated(); req.user=jwt.verify(token,config.JWT_SECRET); next(); }
  catch(e){ next(e.status ? e : unauthenticated()); }
}

