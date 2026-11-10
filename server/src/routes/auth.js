import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../db/models.js';
import { config } from '../config.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../lib/errors.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
const r=Router();
r.post('/login',validate(z.object({email:z.string().email(),password:z.string().min(1)})),asyncHandler(async(req,res)=>{
  const user=await User.findOne({email:req.body.email.toLowerCase()});
  if(!user || !(await bcrypt.compare(req.body.password,user.passwordHash))) throw new AppError('BAD_CREDENTIALS','Email or password is incorrect.',401);
  const token=jwt.sign({sub:String(user._id),email:user.email},config.JWT_SECRET,{expiresIn:'12h'});
  res.cookie('proofpay',token,{httpOnly:true,sameSite:'lax',secure:config.NODE_ENV==='production',maxAge:12*60*60*1000});
  res.json({user:{id:user.id,email:user.email,name:user.name}});
}));
r.post('/logout',requireAuth,(_req,res)=>res.clearCookie('proofpay',{httpOnly:true,sameSite:'lax',secure:config.NODE_ENV==='production'}).status(204).end());
r.get('/me',requireAuth,asyncHandler(async(req,res)=>{const user=await User.findById(req.user.sub).select('email name businessName');res.json({user})}));
export default r;

