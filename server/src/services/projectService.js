import { Client, Project, Milestone } from '../db/models.js';
import { newClientToken, hashClientToken } from '../lib/tokens.js';
import { config } from '../config.js';
import { AppError } from '../lib/errors.js';
export async function createProject(ownerId,input){
  const client=await Client.create({ownerId,...input.client}); const token=newClientToken();
  const project=await Project.create({ownerId,clientId:client.id,title:input.title,description:input.description,github:input.github,refundCapPct:input.refundCapPct??30,clientTokenHash:hashClientToken(token),clientTokenExpiresAt:new Date(Date.now()+30*864e5)});
  return {project,clientLink:`${config.APP_BASE_URL}/c/${token}`};
}
export async function ownedProject(ownerId,id){const p=await Project.findOne({_id:id,ownerId}).populate('clientId');if(!p)throw new AppError('NOT_FOUND','Project not found.',404);return p}
export async function listProjects(ownerId){return Project.find({ownerId,status:'ACTIVE'}).populate('clientId').lean()}
export async function rotateClientLink(ownerId,id){const p=await ownedProject(ownerId,id);const token=newClientToken();p.clientTokenHash=hashClientToken(token);p.clientTokenExpiresAt=new Date(Date.now()+30*864e5);await p.save();return `${config.APP_BASE_URL}/c/${token}`}
export async function projectDetail(ownerId,id){const project=await ownedProject(ownerId,id);const milestones=await Milestone.find({projectId:id}).sort({index:1});return {project,milestones}}

