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

// GET: List all mitras
export async function GET(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    const result = await db.prepare('SELECT * FROM mitras ORDER BY created_at ASC').all();
    const formatted = (result.results || []).map((row: any) => {
      let customPrices = {};
      if (row.custom_prices) {
        try {
          customPrices = typeof row.custom_prices === 'string' ? JSON.parse(row.custom_prices) : row.custom_prices;
        } catch (e) {
          customPrices = {};
        }
      }
      return { ...row, customPrices };
    });
    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create or update a mitra
export async function POST(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    const body = await request.json();
    const { id, name, type, whatsapp, address, customPrices } = body;

    if (!id || !name) {
      return NextResponse.json({ success: false, error: 'Data mitra tidak lengkap' }, { status: 400 });
    }

    const customPricesJson = customPrices ? (typeof customPrices === 'string' ? customPrices : JSON.stringify(customPrices)) : '{}';

    const existing = await db.prepare('SELECT id FROM mitras WHERE id = ?').bind(id).first();

    if (existing) {
      await db.prepare('UPDATE mitras SET name = ?, type = ?, whatsapp = ?, address = ?, custom_prices = ? WHERE id = ?')
        .bind(name, type || 'Warung', whatsapp || '', address || '', customPricesJson, id)
        .run();
    } else {
      await db.prepare('INSERT INTO mitras (id, name, type, whatsapp, address, custom_prices, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .bind(id, name, type || 'Warung', whatsapp || '', address || '', customPricesJson, 'active')
        .run();
    }

    await db.prepare('INSERT INTO audit_logs (id, action, trx_number, details) VALUES (?, ?, ?, ?)')
      .bind(`AUD-${Date.now()}`, existing ? 'MITRA_UPDATED' : 'MITRA_CREATED', id, `Mitra ${name}`)
      .run();

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Delete a mitra
export async function DELETE(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID mitra diperlukan' }, { status: 400 });

    await db.prepare('DELETE FROM mitras WHERE id = ?').bind(id).run();
    await db.prepare('INSERT INTO audit_logs (id, action, trx_number, details) VALUES (?, ?, ?, ?)')
      .bind(`AUD-${Date.now()}`, 'MITRA_DELETED', id, `Deleted mitra ${id}`)
      .run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

