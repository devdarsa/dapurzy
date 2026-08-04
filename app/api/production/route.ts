import { NextResponse } from 'next/server';
import { calculatePrecisionHpp } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { batchId, productId, totalCost, producedQty } = body;

    if (!batchId || !productId || !producedQty || producedQty <= 0) {
      return NextResponse.json(
        { success: false, error: 'Parameter produksi tidak lengkap atau tidak valid' },
        { status: 400 }
      );
    }

    const calculatedHpp = calculatePrecisionHpp(totalCost || 0, producedQty);

    return NextResponse.json({
      success: true,
      data: {
        batchId,
        productId,
        producedQty,
        calculatedHpp,
        status: 'produced',
        message: `Produksi selesai. HPP presisi = Rp ${calculatedHpp}/pcs`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal memproses kalkulasi HPP produksi' },
      { status: 500 }
    );
  }
}
