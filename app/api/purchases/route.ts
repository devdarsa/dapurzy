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
    const { id, batchId, itemsDescription, totalCost, supplier, items } = body;

    if (!itemsDescription || !totalCost || totalCost <= 0) {
      return NextResponse.json({ success: false, error: 'Deskripsi dan total biaya belanja harus valid' }, { status: 400 });
    }

    await db
      .prepare(
        'INSERT INTO purchase_batches (id, batch_id, items_description, total_cost, supplier, status, product_id, produced_qty, calculated_hpp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(id, batchId, itemsDescription, totalCost, supplier || 'Supplier Umum', 'pending_production', null, 0, 0)
      .run();

    // Insert individual purchase_items if provided
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        await db
          .prepare(
            'INSERT INTO purchase_items (id, batch_id, name, qty, unit, price_per_unit, total) VALUES (?, ?, ?, ?, ?, ?, ?)'
          )
          .bind(
            `PI-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            batchId,
            item.name || '',
            item.qty || 1,
            item.unit || 'kg',
            item.pricePerUnit || 0,
            item.total || 0
          )
          .run();
      }
    }

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


// PUT: Update batch to produced status with single or multi-product outputs
export async function PUT(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    const body = await request.json();
    const { batchId, outputs, productId, producedQty, calculatedHpp } = body;

    if (!batchId) {
      return NextResponse.json({ success: false, error: 'Batch ID harus diisi' }, { status: 400 });
    }

    const itemsToProcess: Array<{
      productId: string;
      allocatedCost: number;
      producedQty: number;
      calculatedHpp: number;
    }> = [];

    if (Array.isArray(outputs) && outputs.length > 0) {
      outputs.forEach((o: any) => {
        if (o.productId && o.producedQty > 0) {
          itemsToProcess.push({
            productId: o.productId,
            allocatedCost: o.allocatedCost || 0,
            producedQty: o.producedQty,
            calculatedHpp: o.calculatedHpp || 0,
          });
        }
      });
    } else if (productId && producedQty > 0) {
      itemsToProcess.push({
        productId,
        allocatedCost: body.allocatedCost || 0,
        producedQty,
        calculatedHpp: calculatedHpp || 0,
      });
    }

    if (itemsToProcess.length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada hasil produksi yang valid' }, { status: 400 });
    }

    const totalQty = itemsToProcess.reduce((sum, item) => sum + item.producedQty, 0);
    const avgHpp = itemsToProcess.reduce((sum, item) => sum + item.allocatedCost, 0) / (totalQty || 1);

    // 1. Mark purchase_batch as produced
    await db
      .prepare('UPDATE purchase_batches SET status = ?, product_id = ?, produced_qty = ?, calculated_hpp = ? WHERE batch_id = ?')
      .bind('produced', itemsToProcess[0].productId, totalQty, Math.round(avgHpp), batchId)
      .run();

    // 2. Process each produced product output
    for (const item of itemsToProcess) {
      // Update product avg_hpp
      await db
        .prepare('UPDATE products SET avg_hpp = ? WHERE id = ?')
        .bind(item.calculatedHpp, item.productId)
        .run();

      // Add stock to gudang
      const existingStock = await db
        .prepare("SELECT * FROM product_stocks WHERE productId = ? AND location_type = 'gudang'")
        .bind(item.productId)
        .first();

      if (existingStock) {
        await db
          .prepare('UPDATE product_stocks SET quantity = quantity + ? WHERE id = ?')
          .bind(item.producedQty, existingStock.id)
          .run();
      } else {
        await db
          .prepare("INSERT INTO product_stocks (id, productId, location_type, mitra_id, quantity) VALUES (?, ?, 'gudang', null, ?)")
          .bind(`STK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, item.productId, item.producedQty)
          .run();
      }
    }

    const trxNum = `TRX-PROD-${Date.now().toString().slice(-6)}`;
    await db
      .prepare('INSERT INTO audit_logs (id, action, trx_number, details) VALUES (?, ?, ?, ?)')
      .bind(`AUD-${Date.now()}`, 'PRODUCTION_COMPLETED', trxNum, `Produksi ${itemsToProcess.length} jenis produk (${totalQty} pcs) dari ${batchId}`)
      .run();

    return NextResponse.json({ success: true, count: itemsToProcess.length, totalQty });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
