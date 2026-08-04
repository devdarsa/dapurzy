import { NextResponse } from 'next/server';
import { calculatePrecisionHpp } from '@/lib/utils';

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

export async function POST(request: Request) {
  const db = getDB(request);

  try {
    const body = await request.json();
    const { batchId, productId, totalCost: inputTotalCost, producedQty } = body;

    if (!batchId || !productId || !producedQty || producedQty <= 0) {
      return NextResponse.json(
        { success: false, error: 'Parameter produksi tidak lengkap atau tidak valid' },
        { status: 400 }
      );
    }

    let batchCost = inputTotalCost || 0;
    if (db && (!batchCost || batchCost <= 0)) {
      const batchRow = await db
        .prepare('SELECT total_cost FROM purchase_batches WHERE batch_id = ?')
        .bind(batchId)
        .first();
      if (batchRow) {
        batchCost = batchRow.total_cost || 0;
      }
    }

    const calculatedHpp = calculatePrecisionHpp(batchCost, producedQty);

    if (db) {
      // 1. Update purchase_batches status to habis
      await db
        .prepare('UPDATE purchase_batches SET status = ?, product_id = ?, produced_qty = ?, calculated_hpp = ? WHERE batch_id = ?')
        .bind('habis', productId, producedQty, calculatedHpp, batchId)
        .run();

      // 2. Update product avg_hpp
      await db
        .prepare('UPDATE products SET avg_hpp = ? WHERE id = ?')
        .bind(calculatedHpp, productId)
        .run();

      // 3. Add produced qty to gudang stock
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
          .bind(`STK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, productId, producedQty)
          .run();
      }

      // Audit log
      const trxNum = `TRX-PROD-${Date.now().toString().slice(-6)}`;
      await db
        .prepare('INSERT INTO audit_logs (id, action, trx_number, details) VALUES (?, ?, ?, ?)')
        .bind(`AUD-${Date.now()}`, 'PRODUCTION_COMPLETED', trxNum, `Pengolahan batch ${batchId}: ${producedQty} pcs produk ${productId}, HPP=${calculatedHpp}/unit`)
        .run();
    }

    return NextResponse.json({
      success: true,
      data: {
        batchId,
        productId,
        producedQty,
        calculatedHpp,
        status: 'habis',
        message: `Pengolahan selesai. HPP presisi = Rp ${calculatedHpp}/pcs`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses pengolahan produksi' },
      { status: 500 }
    );
  }
}
