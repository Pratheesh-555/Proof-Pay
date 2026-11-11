import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import milestoneRoutes from './routes/milestones.js';
import clientRoutes from './routes/client.js';
import webhookRoutes from './routes/webhooks.js';
import {errorHandler} from './middleware/errorHandler.js';
import {asyncHandler} from './middleware/asyncHandler.js';
import {config} from './config.js';

const app=express();
if (config.NODE_ENV === 'production') app.set('trust proxy', 1);
app.disable('x-powered-by');app.use(helmet());app.use(cookieParser());
app.get('/api/health',asyncHandler(async(_req,res)=>{const mongoose=await import('mongoose');res.json({ok:true,db:mongoose.default.connection.readyState===1,paypalTokenOk:null,version:'0.1.0'})}));
// PayPal signatures require the exact raw bytes; register before JSON parsing.
app.use('/api/webhooks',webhookRoutes);
app.use(express.json({limit:'1mb'}));
app.use('/api/auth',rateLimit({windowMs:60_000,limit:10,standardHeaders:true,legacyHeaders:false}),authRoutes);
app.use('/api/projects',projectRoutes);
app.use('/api',milestoneRoutes);
import caseRoutes from './routes/cases.js';
app.use('/api/client',clientRoutes);
app.use('/api',caseRoutes);
app.use('/api',(_req,res)=>res.status(404).json({error:{code:'NOT_FOUND',message:'API route not found.'}}));
const webDist=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../web/dist');
app.use(express.static(webDist));
app.get('*',(req,res)=>res.sendFile(path.join(webDist,'index.html')));
app.use((err,req,res,next)=>errorHandler(err,req,res,next));
export default app;

