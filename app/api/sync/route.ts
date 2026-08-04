import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Helper to get D1 binding from Cloudflare Worker env
function getDB(request: Request): any {
  return (request as any).cf?.env?.DB ?? (globalThis as any).__D1_DB ?? null;
}

// GET: Load all app data from D1
export async function GET(request: Request) {
  const db = getDB(request);
  if (!db) {
    return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });
  }

  try {
    const [products, mitras, batches, stocks, sales, capitalLogs, movements, auditLogs, cashRow] = await Promise.all([
      db.prepare('SELECT * FROM products ORDER BY created_at ASC').all(),
      db.prepare('SELECT * FROM mitras ORDER BY created_at ASC').all(),
      db.prepare('SELECT * FROM purchase_batches ORDER BY created_at DESC').all(),
      db.prepare('SELECT * FROM product_stocks').all(),
      db.prepare('SELECT * FROM sales ORDER BY created_at DESC').all(),
      db.prepare('SELECT * FROM capital_logs ORDER BY created_at DESC').all(),
      db.prepare('SELECT * FROM stock_movements ORDER BY created_at DESC').all(),
      db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100').all(),
      db.prepare('SELECT * FROM capital_logs ORDER BY created_at DESC LIMIT 1').first(),
    ]);

    // Calculate total cash balance from capital logs + sales - purchases
    const totalCapital = (capitalLogs.results || []).reduce((s: number, r: any) => s + (r.amount || 0), 0);
    const totalSales = (sales.results || []).reduce((s: number, r: any) => s + (r.total_amount || 0), 0);
    const totalBatchCost = (batches.results || []).reduce((s: number, r: any) => s + (r.total_cost || 0), 0);
    const cashBalance = totalCapital + totalSales - totalBatchCost;

    return NextResponse.json({
      success: true,
      source: 'D1_Remote',
      data: {
        cashBalance,
        activeCapital: totalCapital,
        products: products.results || [],
        mitras: mitras.results || [],
        purchaseBatches: batches.results || [],
        stocks: stocks.results || [],
        sales: sales.results || [],
        capitalLogs: capitalLogs.results || [],
        movements: movements.results || [],
        auditLogs: auditLogs.results || [],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return NextResponse.json({ success: true });
}
