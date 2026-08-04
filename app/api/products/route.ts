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

// GET: List all products
export async function GET(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    const result = await db.prepare('SELECT * FROM products ORDER BY created_at ASC').all();
    return NextResponse.json({ success: true, data: result.results || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create or update a product
export async function POST(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    const body = await request.json();
    const { id, name, category, price, avgHpp } = body;

    if (!id || !name || !category || !price) {
      return NextResponse.json({ success: false, error: 'Data produk tidak lengkap' }, { status: 400 });
    }

    const existing = await db.prepare('SELECT id FROM products WHERE id = ?').bind(id).first();

    if (existing) {
      await db.prepare('UPDATE products SET name = ?, category = ?, price = ?, avg_hpp = ? WHERE id = ?')
        .bind(name, category, price, avgHpp || 0, id)
        .run();
    } else {
      await db.prepare('INSERT INTO products (id, name, category, price, avg_hpp, status) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(id, name, category, price, avgHpp || 0, 'active')
        .run();
    }

    await db.prepare('INSERT INTO audit_logs (id, action, trx_number, details) VALUES (?, ?, ?, ?)')
      .bind(`AUD-${Date.now()}`, existing ? 'PRODUCT_UPDATED' : 'PRODUCT_CREATED', id, `Product ${name}`)
      .run();

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Delete a product
export async function DELETE(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID produk diperlukan' }, { status: 400 });

    await db.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
    await db.prepare('INSERT INTO audit_logs (id, action, trx_number, details) VALUES (?, ?, ?, ?)')
      .bind(`AUD-${Date.now()}`, 'PRODUCT_DELETED', id, `Deleted product ${id}`)
      .run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
