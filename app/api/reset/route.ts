import { NextResponse } from 'next/server';

export const runtime = 'edge';

function getDB(request: Request): any {
  return (request as any).cf?.env?.DB ?? (globalThis as any).__D1_DB ?? null;
}

// POST: Reset all app data in D1
export async function POST(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    await db.prepare('DELETE FROM sales').run();
    await db.prepare('DELETE FROM stock_movements').run();
    await db.prepare('DELETE FROM product_stocks').run();
    await db.prepare('DELETE FROM purchase_batches').run();
    await db.prepare('DELETE FROM capital_logs').run();
    await db.prepare('DELETE FROM audit_logs').run();
    await db.prepare('DELETE FROM products').run();
    await db.prepare('DELETE FROM mitras').run();

    await db.prepare('INSERT INTO audit_logs (id, action, trx_number, details) VALUES (?, ?, ?, ?)')
      .bind(`AUD-RESET-${Date.now()}`, 'FACTORY_RESET', 'SYS-RESET', 'Semua data dihapus (Factory Reset)')
      .run();

    return NextResponse.json({ success: true, message: 'Seluruh data berhasil dihapus dari D1 Database.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
