import crypto from 'node:crypto';
export function canonicalJSON(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJSON).join(',')}]`;
  if (value && typeof value === 'object' && !(value instanceof Date)) return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonicalJSON(value[k])}`).join(',')}}`;
  return JSON.stringify(value instanceof Date ? value.toISOString() : value);
}
export const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

