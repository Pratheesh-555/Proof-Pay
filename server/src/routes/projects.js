import {Router} from 'express';import {z} from 'zod';import {requireAuth} from '../middleware/auth.js';import {validate} from '../middleware/validate.js';import {asyncHandler} from '../middleware/asyncHandler.js';import {createProject,listProjects,projectDetail,ownedProject,rotateClientLink} from '../services/projectService.js';
const r=Router();r.use(requireAuth);
r.get('/',asyncHandler(async(req,res)=>res.json({projects:await listProjects(req.user.sub)})));
r.post('/',validate(z.object({title:z.string().min(1).max(120),description:z.string().max(2000).optional(),client:z.object({name:z.string().min(1),email:z.string().email()}),github:z.object({owner:z.string(),repo:z.string()}).optional(),refundCapPct:z.number().min(0).max(100).optional()})),asyncHandler(async(req,res)=>res.status(201).json(await createProject(req.user.sub,req.body))));
r.get('/:id',asyncHandler(async(req,res)=>res.json(await projectDetail(req.user.sub,req.params.id))));
r.patch('/:id',validate(z.object({title:z.string().min(1).optional(),description:z.string().max(2000).optional(),github:z.object({owner:z.string(),repo:z.string()}).optional(),refundCapPct:z.number().min(0).max(100).optional(),autoReminders:z.boolean().optional()})),asyncHandler(async(req,res)=>{const p=await ownedProject(req.user.sub,req.params.id);Object.assign(p,req.body);await p.save();res.json({project:p})}));
r.post('/:id/client-link/rotate',asyncHandler(async(req,res)=>res.json({clientLink:await rotateClientLink(req.user.sub,req.params.id)})));
export default r;

