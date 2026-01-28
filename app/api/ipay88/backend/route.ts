
import { NextRequest } from 'next/server';
import { verifyResponseSignature, parseSlotId } from '@/lib/ipay88-utils';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries()) as any;

    const {
      MerchantCode,
      PaymentId,
      RefNo,
      Amount,
      Currency,
      Status,
      Sig,
      ErrorDesc
    } = data;

    // 1. Verifikasi Signature
    const isValid = verifyResponseSignature(PaymentId, RefNo, Amount, Currency, Status, Sig);

    if (!isValid) {
      console.error("INVALID IPAY88 SIGNATURE DETECTED");
      return new Response("INVALID_SIG", { status: 400 });
    }

    // 2. Jika Status = 1 (Success), Proses Inventory
    if (Status === "1") {
      const slotId = parseSlotId(RefNo);
      
      // LOGIK: Di sini anda panggil DB untuk deduct stock
      // await db.inventory.decrement({ where: { slotId }, by: 1 });
      // await db.sales.create({ data: { refNo: RefNo, amount: parseFloat(Amount), slotId } });

      console.log(`PAYMENT SUCCESS: Slot ${slotId} deducted.`);
      
      // IPAY88 REQUIREMENT: Must return RECEIVEOK as plain text
      return new Response("RECEIVEOK", {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    return new Response("RECEIVED_FAILED_STATUS", { status: 200 });
  } catch (error) {
    console.error("IPAY88_CALLBACK_ERROR", error);
    return new Response("INTERNAL_ERROR", { status: 500 });
  }
}
