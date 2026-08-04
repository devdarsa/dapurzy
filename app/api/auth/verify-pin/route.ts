import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pin = body.pin || '';

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({ valid: false, error: 'PIN tidak valid' }, { status: 400 });
    }

    const db = getDB(request);
    if (!db) {
      return NextResponse.json({ valid: false, error: 'Database D1 tidak terhubung' }, { status: 503 });
    }

    const userRes = await db
      .prepare('SELECT id, username FROM users WHERE pin = ? LIMIT 1')
      .bind(pin)
      .first();

    if (userRes) {
      return NextResponse.json({ valid: true, user: { id: userRes.id, username: userRes.username } });
    }

    return NextResponse.json({ valid: false, error: 'PIN Salah' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: 'Gagal memverifikasi PIN pada database' }, { status: 500 });
  }
}
