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

// GET: Load all app data from D1
export async function GET(request: Request) {
  const db = getDB(request);
  if (!db) {
    return NextResponse.json({
      success: true,
      source: 'D1_Initializing',
      data: {
        cashBalance: 0,
        activeCapital: 0,
        products: [],
        mitras: [],
        purchaseBatches: [],
        stocks: [],
        sales: [],
        capitalLogs: [],
        movements: [],
        auditLogs: [],
      },
    });
  }

  try {
    const [products, mitras, batches, stocks, sales, capitalLogs, movements, auditLogs] = await Promise.all([
      db.prepare('SELECT * FROM products ORDER BY created_at ASC').all().catch(() => ({ results: [] })),
      db.prepare('SELECT * FROM mitras ORDER BY created_at ASC').all().catch(() => ({ results: [] })),
      db.prepare('SELECT * FROM purchase_batches ORDER BY created_at DESC').all().catch(() => ({ results: [] })),
      db.prepare('SELECT * FROM product_stocks').all().catch(() => ({ results: [] })),
      db.prepare('SELECT * FROM sales ORDER BY created_at DESC').all().catch(() => ({ results: [] })),
      db.prepare('SELECT * FROM capital_logs ORDER BY created_at DESC').all().catch(() => ({ results: [] })),
      db.prepare('SELECT * FROM stock_movements ORDER BY created_at DESC').all().catch(() => ({ results: [] })),
      db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100').all().catch(() => ({ results: [] })),
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
    return NextResponse.json({
      success: true,
      source: 'D1_Fallback',
      data: {
        cashBalance: 0,
        activeCapital: 0,
        products: [],
        mitras: [],
        purchaseBatches: [],
        stocks: [],
        sales: [],
        capitalLogs: [],
        movements: [],
        auditLogs: [],
      },
    });
  }
}

export async function POST(request: Request) {
  return NextResponse.json({ success: true });
}
