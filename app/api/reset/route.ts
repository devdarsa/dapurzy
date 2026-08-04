import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

// Secret key untuk memproteksi factory reset dari akses tidak sah.
// Frontend harus mengirim { secret: 'DAPURZY-RESET-2026' } di request body.
const RESET_SECRET = 'DAPURZY-RESET-2026';

// POST: Reset all app data in D1
export async function POST(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  // BUG #10 FIX: Validasi secret key agar factory reset tidak bisa diakses sembarang pihak
  try {
    const body = await request.json();
    if (!body.secret || body.secret !== RESET_SECRET) {
      return NextResponse.json({ success: false, error: 'Akses tidak diizinkan: secret key salah' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ success: false, error: 'Request body tidak valid' }, { status: 400 });
  }

  const errors: string[] = [];

  // BUG #4 FIX: Setiap DELETE dibungkus try-catch individual agar satu tabel yang belum ada
  // tidak menghentikan seluruh proses reset. Urutan: child tables dulu, baru parent.
  const tablesToDelete = [
    'sales',
    'stock_movements',
    'product_stocks',
    'purchase_items',   // Mungkin belum ada di database lama
    'purchase_batches',
    'capital_logs',
    'audit_logs',
    'raw_material_history', // Mungkin belum ada di database lama
    'products',
    'mitras',
  ];

  for (const table of tablesToDelete) {
    try {
      await db.prepare(`DELETE FROM ${table}`).run();
    } catch (e: any) {
      // Catat error tapi lanjutkan (tabel mungkin belum ada)
      errors.push(`${table}: ${e.message}`);
    }
  }

  try {
    await db
      .prepare('INSERT INTO audit_logs (id, action, trx_number, details) VALUES (?, ?, ?, ?)')
      .bind(
        `AUD-RESET-${Date.now()}`,
        'FACTORY_RESET',
        'SYS-RESET',
        `Semua data dihapus (Factory Reset). Skipped tables: ${errors.length > 0 ? errors.join('; ') : 'none'}`
      )
      .run();
  } catch {
    // Tidak bisa audit log jika tabel audit_logs juga bermasalah
  }

  return NextResponse.json({
    success: true,
    message: 'Seluruh data berhasil dihapus dari D1 Database.',
    skippedTables: errors.length > 0 ? errors : undefined,
  });
}
