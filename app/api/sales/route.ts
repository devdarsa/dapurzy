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

// GET: Fetch all sales records
export async function GET(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    const result = await db.prepare('SELECT * FROM sales ORDER BY created_at DESC').all();
    return NextResponse.json({ success: true, data: result.results || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Record a sale / mitra setoran transaction
export async function POST(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    const body = await request.json();
    const {
      id,
      trxNumber,
      productId,
      batchId,
      titipQty = 0,
      returnedQty = 0,
      quantity, // soldQty
      pricePerUnit,
      hppPerUnit = 0,
      totalAmount,
      profit,
      saleType = 'DIRECT',
      mitraId = null,
      paymentMethod = 'CASH',
    } = body;

    const soldQty = Number(quantity) || (titipQty - returnedQty);
    if (!productId || soldQty < 0 || !pricePerUnit) {
      return NextResponse.json({ success: false, error: 'Data penjualan / setoran tidak valid' }, { status: 400 });
    }

    const calculatedTotal = totalAmount || (soldQty * pricePerUnit);
    const recoveredCost = soldQty * hppPerUnit; // Pokok HPP yang dipulihkan ke Kas Modal
    const calculatedProfit = profit !== undefined ? profit : (calculatedTotal - (soldQty * hppPerUnit));

    // 1. Insert into sales table
    await db
      .prepare(
        'INSERT INTO sales (id, trx_number, sale_type, mitra_id, product_id, batch_id, titip_qty, returned_qty, quantity, price_per_unit, total_amount, hpp_per_unit, recovered_cost, profit, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        id,
        trxNumber,
        saleType,
        mitraId,
        productId,
        batchId || null,
        titipQty,
        returnedQty,
        soldQty,
        pricePerUnit,
        calculatedTotal,
        hppPerUnit,
        recoveredCost,
        calculatedProfit,
        paymentMethod
      )
      .run();

    // 2. Record HPP Recovery into capital_logs to restore Kas Modal Operasional
    if (recoveredCost > 0) {
      const capRecoveryId = `CAP-REC-${Date.now()}`;
      await db
        .prepare('INSERT INTO capital_logs (id, trx_number, type, amount, note) VALUES (?, ?, ?, ?, ?)')
        .bind(capRecoveryId, trxNumber, 'HPP_RECOVERY', recoveredCost, `Pemulihan Pokok HPP (${soldQty} pcs x Rp ${hppPerUnit})`)
        .run();
    }

    // 3. Update product_stocks
    if (mitraId) {
      // Reduce Mitra stock by total handled items (sold + returned)
      const totalHandled = soldQty + returnedQty;
      const mitraStockRow = await db
        .prepare("SELECT * FROM product_stocks WHERE productId = ? AND location_type = 'mitra' AND mitra_id = ?")
        .bind(productId, mitraId)
        .first();

      if (mitraStockRow) {
        const newMitraQty = Math.max(0, (mitraStockRow.quantity || 0) - totalHandled);
        await db.prepare('UPDATE product_stocks SET quantity = ? WHERE id = ?').bind(newMitraQty, mitraStockRow.id).run();
      }

      // If returned items exist, return them to Gudang stock
      if (returnedQty > 0) {
        const gudangStockRow = await db
          .prepare("SELECT * FROM product_stocks WHERE productId = ? AND location_type = 'gudang'")
          .bind(productId)
          .first();

        if (gudangStockRow) {
          await db
            .prepare('UPDATE product_stocks SET quantity = quantity + ? WHERE id = ?')
            .bind(returnedQty, gudangStockRow.id)
            .run();
        } else {
          await db
            .prepare("INSERT INTO product_stocks (id, productId, location_type, mitra_id, quantity) VALUES (?, ?, 'gudang', null, ?)")
            .bind(`STK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, productId, returnedQty)
            .run();
        }
      }
    } else if (saleType === 'DIRECT' && soldQty > 0) {
      // Direct home sale: reduce Gudang stock
      const gudangStockRow = await db
        .prepare("SELECT * FROM product_stocks WHERE productId = ? AND location_type = 'gudang'")
        .bind(productId)
        .first();

      if (gudangStockRow) {
        const newGudangQty = Math.max(0, (gudangStockRow.quantity || 0) - soldQty);
        await db.prepare('UPDATE product_stocks SET quantity = ? WHERE id = ?').bind(newGudangQty, gudangStockRow.id).run();
      }
    }

    // 4. Audit log
    await db
      .prepare('INSERT INTO audit_logs (id, action, trx_number, details) VALUES (?, ?, ?, ?)')
      .bind(
        `AUD-${Date.now()}`,
        'SALE_RECORDED',
        trxNumber,
        `${saleType}: Sold ${soldQty} pcs, Omzet ${calculatedTotal}, Cost Restored ${recoveredCost}, Profit ${calculatedProfit}`
      )
      .run();

    return NextResponse.json({ success: true, trxNumber, soldQty, calculatedTotal, recoveredCost, profit: calculatedProfit });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

