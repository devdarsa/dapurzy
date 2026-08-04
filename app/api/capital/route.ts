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

// POST: Record capital injection in D1
export async function POST(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    const body = await request.json();
    const { id, trxNumber, amount, note } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Nominal modal harus lebih dari 0' }, { status: 400 });
    }

    await db
      .prepare('INSERT INTO capital_logs (id, trx_number, amount, note) VALUES (?, ?, ?, ?)')
      .bind(id, trxNumber, amount, note || 'Injeksi Modal Usaha')
      .run();

    await db
      .prepare('INSERT INTO audit_logs (id, action, trx_number, details) VALUES (?, ?, ?, ?)')
      .bind(`AUD-${Date.now()}`, 'CAPITAL_INJECTED', trxNumber, `Injeksi modal ${amount}`)
      .run();

    return NextResponse.json({ success: true, trxNumber });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
