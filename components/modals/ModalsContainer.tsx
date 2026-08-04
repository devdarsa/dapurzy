'use client';

import React from 'react';
import BelanjaBatchModal from '@/components/modals/BelanjaBatchModal';
import PengolahanModal from '@/components/modals/PengolahanModal';
import AmbilMitraModal from '@/components/modals/AmbilMitraModal';
import MitraSettlementModal from '@/components/modals/MitraSettlementModal';
import HomeSalesModal from '@/components/modals/HomeSalesModal';
import CapitalModal from '@/components/modals/CapitalModal';
import ProductModal from '@/components/modals/ProductModal';
import MitraModal from '@/components/modals/MitraModal';
import ResetDataModal from '@/components/modals/ResetDataModal';
import { Product, Mitra, PurchaseBatch, ProductStock, CapitalLog } from '@/lib/types';

interface ModalsContainerProps {
  activeModal: string | null;
  onClose: () => void;
  onOpenModal?: (modal: string) => void;
  operatingCapital: number;
  purchaseBatches: PurchaseBatch[];
  products: Product[];
  mitras: Mitra[];
  stocks: ProductStock[];
  capitalLogs: CapitalLog[];
  editingProduct: Product | null;
  editingMitra: Mitra | null;
  pengolahanInitialBatchId: string;
  setEditingProduct: (p: Product | null) => void;
  setEditingMitra: (m: Mitra | null) => void;
  setPengolahanInitialBatchId: (id: string) => void;
  onBelanjaBatch: (data: { date: string; itemsDescription: string; totalCost: number }) => void;
  onPengolahan: (data: { batchId: string; productId: string; producedQty: number; calculatedHpp: number }) => void;
  onAmbilMitra: (data: { mitraId: string; productId: string; quantity: number; note?: string }) => void;
  onMitraSettlement: (data: any) => void;
  onHomeSalesDeposit: (data: { amount: number; note: string }) => void;
  onCapital: (data: { amount: number; note: string; type?: 'INJECTION' | 'WITHDRAWAL' }) => void;
  onDeleteCapitalLog: (logId: string) => void;
  onCreateOrUpdateProduct: (data: { id?: string; name: string; category: string; price: number }) => void;
  onCreateOrUpdateMitra: (data: { id?: string; name: string; type: string; whatsapp: string; address: string; customPrices?: Record<string, number> }) => void;
  onFactoryReset: () => void;
}

export default function ModalsContainer({
  activeModal,
  onClose,
  onOpenModal,
  operatingCapital,
  purchaseBatches,
  products,
  mitras,
  stocks,
  capitalLogs,
  editingProduct,
  editingMitra,
  pengolahanInitialBatchId,
  setEditingProduct,
  setEditingMitra,
  setPengolahanInitialBatchId,
  onBelanjaBatch,
  onPengolahan,
  onAmbilMitra,
  onMitraSettlement,
  onHomeSalesDeposit,
  onCapital,
  onDeleteCapitalLog,
  onCreateOrUpdateProduct,
  onCreateOrUpdateMitra,
  onFactoryReset,
}: ModalsContainerProps) {
  return (
    <>
      <BelanjaBatchModal
        isOpen={activeModal === 'belanja_batch'}
        onClose={onClose}
        operatingCapital={operatingCapital}
        onOpenCapitalModal={() => onOpenModal && onOpenModal('capital')}
        onSubmit={onBelanjaBatch}
      />

      <PengolahanModal
        isOpen={activeModal === 'pengolahan'}
        onClose={() => { onClose(); setPengolahanInitialBatchId(''); }}
        availableBatches={purchaseBatches.filter((b) => b.status === 'tersedia')}
        products={products}
        initialBatchId={pengolahanInitialBatchId}
        onOpenBelanjaModal={() => onOpenModal && onOpenModal('belanja_batch')}
        onSubmit={onPengolahan}
      />

      <AmbilMitraModal
        isOpen={activeModal === 'ambil_mitra'}
        onClose={onClose}
        mitras={mitras}
        products={products}
        stocks={stocks}
        onSubmit={onAmbilMitra}
      />

      <MitraSettlementModal
        isOpen={activeModal === 'settlement'}
        onClose={onClose}
        products={products}
        mitras={mitras}
        onSubmit={onMitraSettlement}
      />

      <HomeSalesModal
        isOpen={activeModal === 'home_sales'}
        onClose={onClose}
        onSubmit={onHomeSalesDeposit}
      />

      <CapitalModal
        isOpen={activeModal === 'capital'}
        onClose={onClose}
        operatingCapital={operatingCapital}
        capitalLogs={capitalLogs}
        onSubmit={onCapital}
        onDeleteLog={onDeleteCapitalLog}
      />

      <ProductModal
        isOpen={activeModal === 'product'}
        onClose={() => { onClose(); setEditingProduct(null); }}
        products={products}
        initialData={editingProduct}
        onSubmit={onCreateOrUpdateProduct}
      />

      <MitraModal
        isOpen={activeModal === 'mitra'}
        onClose={() => { onClose(); setEditingMitra(null); }}
        initialData={editingMitra}
        products={products}
        onSubmit={onCreateOrUpdateMitra}
      />

      <ResetDataModal
        isOpen={activeModal === 'reset'}
        onClose={onClose}
        onConfirmReset={onFactoryReset}
      />
    </>
  );
}
