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

// POST: Record a stock movement in D1
export async function POST(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    const body = await request.json();
    const { id, trxNumber, productId, type, mitraId, quantity, note, sourceStockId, sourceNewQty, targetStockId, targetNewQty, newTargetStock } = body;

    if (!productId || !type || !quantity || quantity <= 0) {
      return NextResponse.json({ success: false, error: 'Data pergerakan stok tidak lengkap' }, { status: 400 });
    }

    // Insert movement record
    await db
      .prepare('INSERT INTO stock_movements (id, trx_number, product_id, type, mitra_id, quantity, note) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, trxNumber, productId, type, mitraId || null, quantity, note || null)
      .run();

    // Update source stock
    if (sourceStockId !== undefined && sourceNewQty !== undefined) {
      await db.prepare('UPDATE product_stocks SET quantity = ? WHERE id = ?').bind(sourceNewQty, sourceStockId).run();
    }

    // Update or create target stock
    if (targetStockId) {
      await db.prepare('UPDATE product_stocks SET quantity = ? WHERE id = ?').bind(targetNewQty, targetStockId).run();
    } else if (newTargetStock) {
      await db
        .prepare('INSERT INTO product_stocks (id, productId, location_type, mitra_id, quantity) VALUES (?, ?, ?, ?, ?)')
        .bind(newTargetStock.id, newTargetStock.productId, newTargetStock.locationType, newTargetStock.mitraId || null, newTargetStock.quantity)
        .run();
    }

    // Audit log
    await db
      .prepare('INSERT INTO audit_logs (id, action, trx_number, details) VALUES (?, ?, ?, ?)')
      .bind(`AUD-${Date.now()}`, 'STOCK_MOVEMENT', trxNumber, `${type}: ${quantity} pcs produk ${productId}`)
      .run();

    return NextResponse.json({ success: true, trxNumber });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
