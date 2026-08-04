import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pin = body.pin;

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({ valid: false, error: 'PIN tidak valid' }, { status: 400 });
    }

    const env = (process as any).env || {};
    const db = env.DB;

    if (db) {
      try {
        const userRes = await db
          .prepare('SELECT * FROM users WHERE pin = ? LIMIT 1')
          .bind(pin)
          .first();

        if (userRes) {
          return NextResponse.json({
            valid: true,
            user: { id: userRes.id, username: userRes.username, role: userRes.role },
          });
        }
      } catch (dbErr) {
        console.log('D1 auth error:', dbErr);
      }
    }

    // Dynamic Database / Seed fallback for pin 250423
    const isValid = pin === '250423';
    return NextResponse.json({
      valid: isValid,
      user: isValid ? { id: 'u-develzy', username: 'develzy', role: 'owner' } : null,
    });
  } catch (error) {
    return NextResponse.json({ valid: false, error: 'Error verifikasi PIN' }, { status: 500 });
  }
}
