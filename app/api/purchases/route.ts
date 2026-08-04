import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'DAPURZY Purchase Batches Endpoint Active',
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemsDescription, totalCost, supplier } = body;

    if (!itemsDescription || !totalCost || totalCost <= 0) {
      return NextResponse.json(
        { success: false, error: 'Deskripsi dan total biaya belanja harus valid' },
        { status: 400 }
      );
    }

    const batchId = `BATCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    return NextResponse.json({
      success: true,
      data: {
        batchId,
        itemsDescription,
        totalCost,
        supplier: supplier || 'Supplier Umum',
        status: 'pending_production',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal memproses batch belanja' },
      { status: 500 }
    );
  }
}
