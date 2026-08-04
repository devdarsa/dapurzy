import { NextResponse } from 'next/server';
import { calculateTransactionProfit } from '@/lib/utils';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity, pricePerUnit, hppPerUnit, saleType, mitraId, paymentMethod } = body;

    if (!productId || !quantity || quantity <= 0 || !pricePerUnit) {
      return NextResponse.json(
        { success: false, error: 'Data transaksi penjualan tidak valid' },
        { status: 400 }
      );
    }

    const totalAmount = quantity * pricePerUnit;
    const profit = calculateTransactionProfit(quantity, pricePerUnit, hppPerUnit || 0);
    const trxNumber = `TRX-SALE-${Date.now().toString().slice(-4)}`;

    return NextResponse.json({
      success: true,
      data: {
        trxNumber,
        saleType: saleType || 'DIRECT',
        mitraId: mitraId || null,
        productId,
        quantity,
        pricePerUnit,
        totalAmount,
        hppPerUnit,
        profit,
        paymentMethod: paymentMethod || 'CASH',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal mencatat transaksi penjualan' },
      { status: 500 }
    );
  }
}
