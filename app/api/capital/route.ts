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

// GET: Fetch all capital logs from D1
export async function GET(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    const result = await db.prepare('SELECT * FROM capital_logs ORDER BY created_at DESC').all();
    return NextResponse.json({ success: true, data: result.results || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Record capital injection or withdrawal/adjustment in D1
export async function POST(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    const body = await request.json();
    const { id, trxNumber, amount, note, type = 'INJECTION' } = body;

    if (!amount || amount === 0) {
      return NextResponse.json({ success: false, error: 'Nominal modal tidak boleh 0' }, { status: 400 });
    }

    const finalAmount = type === 'WITHDRAWAL' ? -Math.abs(amount) : amount;
    const defaultNote = type === 'WITHDRAWAL' ? 'Penarikan / Koreksi Modal' : 'Injeksi Modal Usaha';

    await db
      .prepare('INSERT INTO capital_logs (id, trx_number, type, amount, note) VALUES (?, ?, ?, ?, ?)')
      .bind(id, trxNumber, type, finalAmount, note || defaultNote)
      .run();

    await db
      .prepare('INSERT INTO audit_logs (id, action, trx_number, details) VALUES (?, ?, ?, ?)')
      .bind(`AUD-${Date.now()}`, type === 'WITHDRAWAL' ? 'CAPITAL_WITHDRAWN' : 'CAPITAL_INJECTED', trxNumber, `${defaultNote}: ${finalAmount}`)
      .run();

    return NextResponse.json({ success: true, trxNumber, finalAmount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Delete an old capital log entry from D1
export async function DELETE(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID log modal tidak ditemukan' }, { status: 400 });
    }

    await db.prepare('DELETE FROM capital_logs WHERE id = ?').bind(id).run();

    await db
      .prepare('INSERT INTO audit_logs (id, action, trx_number, details) VALUES (?, ?, ?, ?)')
      .bind(`AUD-${Date.now()}`, 'CAPITAL_LOG_DELETED', id, `Hapus log modal ID ${id}`)
      .run();

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
