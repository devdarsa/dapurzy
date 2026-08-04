import { NextResponse } from 'next/server';

export const runtime = 'edge';

function getDB(request: Request): any {
  return (request as any).cf?.env?.DB ?? (globalThis as any).__D1_DB ?? null;
}

// GET: Fetch all raw material history from D1
export async function GET(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    const result = await db
      .prepare('SELECT * FROM raw_material_history ORDER BY buy_count DESC, updated_at DESC')
      .all();
    return NextResponse.json({ success: true, data: result.results || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Upsert a raw material history entry in D1
export async function POST(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    const body = await request.json();
    const items: Array<{ name: string; unit: string; lastPrice: number }> = body.items;

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada item untuk disimpan' }, { status: 400 });
    }

    for (const item of items) {
      if (!item.name?.trim()) continue;
      const name = item.name.trim();
      const existing = await db
        .prepare('SELECT id, buy_count FROM raw_material_history WHERE name = ? COLLATE NOCASE')
        .bind(name)
        .first();

      if (existing) {
        await db
          .prepare(
            'UPDATE raw_material_history SET unit = ?, last_price = ?, buy_count = buy_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
          )
          .bind(item.unit || existing.unit || 'kg', item.lastPrice || 0, existing.id)
          .run();
      } else {
        await db
          .prepare(
            'INSERT INTO raw_material_history (id, name, unit, last_price, buy_count) VALUES (?, ?, ?, ?, ?)'
          )
          .bind(`RMH-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name, item.unit || 'kg', item.lastPrice || 0, 1)
          .run();
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
