import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, type, mitraId, quantity, note } = body;

    if (!productId || !type || !mitraId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Data pergerakan stok tidak lengkap' },
        { status: 400 }
      );
    }

    const trxNumber = `TRX-MOV-${Date.now().toString().slice(-4)}`;

    return NextResponse.json({
      success: true,
      data: {
        trxNumber,
        productId,
        type,
        mitraId,
        quantity,
        note: note || null,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal memproses pergerakan stok' },
      { status: 500 }
    );
  }
}
