import { Project } from '../db/models.js';
import { hashClientToken } from '../lib/tokens.js';
import { AppError } from '../lib/errors.js';
export async function requireClientToken(req,_res,next){
  try { const token=req.get('X-Client-Token') ?? req.params.token; if(!token) throw new AppError('LINK_EXPIRED','Ask the freelancer for a new review link.',401);
    const project=await Project.findOne({clientTokenHash:hashClientToken(token),clientTokenExpiresAt:{$gt:new Date()},status:'ACTIVE'});
    if(!project) throw new AppError('LINK_EXPIRED','Ask the freelancer for a new review link.',401); req.project=project; next();
  } catch(e){next(e)}
}

