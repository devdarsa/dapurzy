import { NextResponse } from 'next/server';

export const runtime = 'edge';

function getDB(request: Request): any {
  return (request as any).cf?.env?.DB ?? (globalThis as any).__D1_DB ?? null;
}

export async function POST(request: Request) {
  const db = getDB(request);
  if (!db) return NextResponse.json({ valid: false, error: 'Database tidak tersedia' }, { status: 503 });

  try {
    const body = await request.json();
    const pin = body.pin;

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({ valid: false, error: 'PIN tidak valid' }, { status: 400 });
    }

    const userRes = await db
      .prepare('SELECT id, username FROM users WHERE pin = ? LIMIT 1')
      .bind(pin)
      .first();

    if (userRes) {
      return NextResponse.json({ valid: true, user: { id: userRes.id, username: userRes.username } });
    }

    return NextResponse.json({ valid: false });
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }
}
