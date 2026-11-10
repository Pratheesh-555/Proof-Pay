import crypto from 'node:crypto';
import { config } from '../config.js';
export const newClientToken = () => crypto.randomBytes(32).toString('base64url');
export const hashClientToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
export const hashIp = (ip) => crypto.createHmac('sha256', config.IP_HASH_SALT).update(ip ?? '').digest('hex');

