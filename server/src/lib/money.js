import { AppError } from './errors.js';
export function dollarsToCents(value) {
  if (!/^\d+(\.\d{1,2})?$/.test(String(value))) throw new AppError('INVALID_MONEY', 'Amount must be a positive USD value with up to two decimals.', 400);
  const [whole, fraction = ''] = String(value).split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(cents) || cents < 1) throw new AppError('INVALID_MONEY', 'Amount must be greater than zero.', 400);
  return cents;
}
export const centsToDollars = (cents) => (cents / 100).toFixed(2);

