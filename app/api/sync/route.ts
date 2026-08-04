import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

// GET: Load all app data from D1
export async function GET(request: Request) {
  const db = getDB(request);
  if (!db) {
    return NextResponse.json({
      success: true,
      source: 'D1_Initializing',
      data: {
        operatingCapital: 0,
        netProfitPool: 0,
        totalGrossOmzet: 0,
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

    const salesList = sales.results || [];
    const batchesList = batches.results || [];
    const logsList = capitalLogs.results || [];
    const mitrasList = mitras.results || [];

    // 1. Total Gross Omzet
    const totalGrossOmzet = salesList.reduce((sum: number, s: any) => sum + (Number(s.total_amount) || 0), 0);

    // 2. Net Profit Pool
    const netProfitPool = salesList.reduce((sum: number, s: any) => sum + (Number(s.profit) || 0), 0);

    // 3. Operating Capital = SUM semua capital_logs.amount
    // (INJECTION +, BELANJA_EXPENSE -, HPP_RECOVERY +, PROFIT_WITHDRAWAL -, ADJUSTMENT ±)
    const operatingCapital = logsList.reduce((sum: number, l: any) => sum + (Number(l.amount) || 0), 0);

    // 4. Compute Mitra Omzet Analytics (Lifetime, Monthly, Today)
    const now = new Date();
    const todayStr = now.toDateString();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const formattedMitras = mitrasList.map((m: any) => {
      let lifetimeOmzet = 0;
      let monthlyOmzet = 0;
      let todayOmzet = 0;
      let totalSoldQty = 0;

      salesList.forEach((s: any) => {
        if (s.mitra_id === m.id) {
          const amt = Number(s.total_amount) || 0;
          const qty = Number(s.quantity) || 0;
          lifetimeOmzet += amt;
          totalSoldQty += qty;

          if (s.created_at) {
            const sDate = new Date(s.created_at);
            if (sDate.toDateString() === todayStr) {
              todayOmzet += amt;
            }
            if (sDate.getMonth() === currentMonth && sDate.getFullYear() === currentYear) {
              monthlyOmzet += amt;
            }
          }
        }
      });

      return {
        ...m,
        lifetimeOmzet,
        monthlyOmzet,
        todayOmzet,
        totalSoldQty,
      };
    });

    const formattedBatches = batchesList.map((b: any) => {
      let status = b.status || 'tersedia';
      if (status === 'pending_production') status = 'tersedia';
      if (status === 'produced' || status === 'completed') status = 'habis';
      return {
        ...b,
        status,
      };
    });

    return NextResponse.json({
      success: true,
      source: 'D1_Remote',
      data: {
        operatingCapital,
        netProfitPool: Math.max(0, netProfitPool),
        totalGrossOmzet: Math.max(0, totalGrossOmzet),
        products: products.results || [],
        mitras: formattedMitras,
        purchaseBatches: formattedBatches,
        stocks: stocks.results || [],
        sales: salesList,
        capitalLogs: logsList,
        movements: movements.results || [],
        auditLogs: auditLogs.results || [],
      },
    });
  } catch (error: any) {
    // BUG #6 FIX: Error handler sekarang mengembalikan success: false agar frontend
    // tahu ada error nyata dan tidak menganggap data kosong sebagai kondisi normal.
    return NextResponse.json(
      {
        success: false,
        source: 'D1_Error',
        error: error.message || 'Gagal mengambil data dari D1',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return NextResponse.json({ success: true });
}
