import { NextResponse } from 'next/server';

export const runtime = 'edge';

function getDB(request: Request): any {
  const env = (process as any).env || {};
  const reqEnv = (request as any).env || (request as any).cf?.env || {};
  const globEnv = (globalThis as any).env || (globalThis as any) || {};

  return (
    env.DB ||
    reqEnv.DB ||
    globEnv.DB ||
    (globalThis as any).__D1_DB ||
    null
  );
}

// POST: Record a sale transaction in D1
export async function POST(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    const body = await request.json();
    const { id, trxNumber, productId, quantity, pricePerUnit, hppPerUnit, totalAmount, profit, saleType, mitraId, paymentMethod, stockId, newStockQty } = body;

    if (!productId || !quantity || quantity <= 0 || !pricePerUnit) {
      return NextResponse.json({ success: false, error: 'Data penjualan tidak valid' }, { status: 400 });
    }

    // Insert sale record
    await db
      .prepare(
        'INSERT INTO sales (id, trx_number, sale_type, mitra_id, product_id, quantity, price_per_unit, total_amount, hpp_per_unit, profit, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(id, trxNumber, saleType || 'DIRECT', mitraId || null, productId, quantity, pricePerUnit, totalAmount, hppPerUnit || 0, profit || 0, paymentMethod || 'CASH')
      .run();

    // Update stock quantity
    if (stockId !== undefined && newStockQty !== undefined) {
      await db.prepare('UPDATE product_stocks SET quantity = ? WHERE id = ?').bind(newStockQty, stockId).run();
    }

    // Record as capital income
    const capitalId = `CAP-IN-${Date.now()}`;
    await db
      .prepare('INSERT INTO capital_logs (id, trx_number, amount, note) VALUES (?, ?, ?, ?)')
      .bind(capitalId, trxNumber, totalAmount, `Penjualan ${quantity}x produk ${productId}`)
      .run();

    // Audit log
    await db
      .prepare('INSERT INTO audit_logs (id, action, trx_number, details) VALUES (?, ?, ?, ?)')
      .bind(`AUD-${Date.now()}`, 'SALE_RECORDED', trxNumber, `Sold ${quantity} pcs, omzet ${totalAmount}, profit ${profit}`)
      .run();

    return NextResponse.json({ success: true, trxNumber });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
