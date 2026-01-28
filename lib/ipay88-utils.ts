
import crypto from 'crypto';

export const MERCHANT_CODE = "M46662";
export const MERCHANT_KEY = "LLBUOQx2Mo";

export function generateRequestSignature(refNo: string, amount: string, currency: string, xfield1: string = "") {
  const data = MERCHANT_KEY + MERCHANT_CODE + refNo + amount.replace(/[.,]/g, '') + currency + xfield1;
  return crypto.createHmac('sha512', MERCHANT_KEY).update(data).digest('hex');
}

export function verifyResponseSignature(paymentId: string, refNo: string, amount: string, currency: string, status: string, providedSignature: string) {
  const data = MERCHANT_KEY + MERCHANT_CODE + paymentId + refNo + amount.replace(/[.,]/g, '') + currency + status;
  const calculatedSignature = crypto.createHmac('sha512', MERCHANT_KEY).update(data).digest('hex');
  return calculatedSignature === providedSignature;
}

export function parseSlotId(refNo: string): string {
  // Format: ORD-SLOT01-TIMESTAMP
  const parts = refNo.split('-');
  return parts[1] || "UNKNOWN";
}
