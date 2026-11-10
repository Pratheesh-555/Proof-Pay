import { Invoice } from '../db/models.js';

const transactionIds = (dispute) => (dispute?.disputed_transactions ?? [])
  .flatMap((item) => [item.seller_transaction_id, item.seller_transaction_id ?? item.transaction_id])
  .filter(Boolean);

export async function mapDispute(dispute) {
  const sellerIds = transactionIds(dispute);
  if (sellerIds.length) {
    const invoice = await Invoice.findOne({ sellerTxnIds: { $in: sellerIds } });
    if (invoice) return { invoice, method: 'SELLER_TXN_ID', confidence: 'HIGH' };
  }

  const invoiceNumber = dispute?.disputed_transactions?.find((item) => item.invoice_number)?.invoice_number;
  if (invoiceNumber) {
    const invoice = await Invoice.findOne({ invoiceNumber });
    if (invoice) return { invoice, method: 'INVOICE_NUMBER', confidence: 'HIGH' };
  }
  return { invoice: null, method: 'UNMAPPED', confidence: 'LOW' };
}