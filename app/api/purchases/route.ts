import { NextResponse } from 'next/server';

export const runtime = 'edge';

function getDB(request: Request): any {
  return (request as any).cf?.env?.DB ?? (globalThis as any).__D1_DB ?? null;
}

// GET all purchase batches from D1
export async function GET(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    const result = await db.prepare('SELECT * FROM purchase_batches ORDER BY created_at DESC').all();
    return NextResponse.json({ success: true, data: result.results || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create new purchase batch in D1
export async function POST(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    const body = await request.json();
    const { id, batchId, itemsDescription, totalCost, supplier } = body;

    if (!itemsDescription || !totalCost || totalCost <= 0) {
      return NextResponse.json({ success: false, error: 'Deskripsi dan total biaya belanja harus valid' }, { status: 400 });
    }

    await db
      .prepare(
        'INSERT INTO purchase_batches (id, batch_id, items_description, total_cost, supplier, status, product_id, produced_qty, calculated_hpp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(id, batchId, itemsDescription, totalCost, supplier || 'Supplier Umum', 'pending_production', null, 0, 0)
      .run();

    // Record in capital_logs as expense
    const capitalId = `CAP-OUT-${Date.now()}`;
    const trxNum = `TRX-BELANJA-${Date.now().toString().slice(-6)}`;
    await db
      .prepare('INSERT INTO capital_logs (id, trx_number, amount, note) VALUES (?, ?, ?, ?)')
      .bind(capitalId, trxNum, -totalCost, `Belanja Batch ${batchId}: ${itemsDescription}`)
      .run();

    // Audit log
    await db
      .prepare('INSERT INTO audit_logs (id, action, trx_number, details) VALUES (?, ?, ?, ?)')
      .bind(`AUD-${Date.now()}`, 'PURCHASE_BATCH_CREATED', trxNum, `Batch ${batchId} biaya ${totalCost}`)
      .run();

    return NextResponse.json({ success: true, batchId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Update batch to produced status with product, qty, hpp
export async function PUT(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    const body = await request.json();
    const { batchId, productId, producedQty, calculatedHpp } = body;

    if (!batchId || !productId || !producedQty || producedQty <= 0) {
      return NextResponse.json({ success: false, error: 'Parameter produksi tidak lengkap' }, { status: 400 });
    }

    await db
      .prepare('UPDATE purchase_batches SET status = ?, product_id = ?, produced_qty = ?, calculated_hpp = ? WHERE batch_id = ?')
      .bind('produced', productId, producedQty, calculatedHpp, batchId)
      .run();

    // Update product avg_hpp
    await db
      .prepare('UPDATE products SET avg_hpp = ? WHERE id = ?')
      .bind(calculatedHpp, productId)
      .run();

    // Add stock to gudang
    const existingStock = await db
      .prepare("SELECT * FROM product_stocks WHERE productId = ? AND location_type = 'gudang'")
      .bind(productId)
      .first();

    if (existingStock) {
      await db
        .prepare('UPDATE product_stocks SET quantity = quantity + ? WHERE id = ?')
        .bind(producedQty, existingStock.id)
        .run();
    } else {
      await db
        .prepare("INSERT INTO product_stocks (id, productId, location_type, mitra_id, quantity) VALUES (?, ?, 'gudang', null, ?)")
        .bind(`STK-${Date.now()}`, productId, producedQty)
        .run();
    }

    const trxNum = `TRX-PROD-${Date.now().toString().slice(-6)}`;
    await db
      .prepare('INSERT INTO audit_logs (id, action, trx_number, details) VALUES (?, ?, ?, ?)')
      .bind(`AUD-${Date.now()}`, 'PRODUCTION_COMPLETED', trxNum, `Produksi ${producedQty} pcs dari ${batchId} HPP=${calculatedHpp}`)
      .run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
