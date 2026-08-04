'use client';

import React, { useState, useMemo } from 'react';
import { PurchaseBatch, Product, Mitra, Sale, PeriodFilter, ProductStock } from '@/lib/types';

// Micro-components imports
import PeriodSwitcherBar from '@/components/dashboard/PeriodSwitcherBar';
import FinancialOverviewCard from '@/components/dashboard/FinancialOverviewCard';
import OperationalActionGrid from '@/components/dashboard/OperationalActionGrid';
import TopMitraLeaderboard from '@/components/dashboard/TopMitraLeaderboard';
import BatchStatusList from '@/components/dashboard/BatchStatusList';

interface DashboardModuleProps {
  operatingCapital: number;
  netProfitPool: number;
  totalGrossOmzet: number;
  purchaseBatches: PurchaseBatch[];
  products: Product[];
  mitras: Mitra[];
  sales: Sale[];
  stocks?: ProductStock[];
  onOpenModal: (
    modal:
      | 'belanja_batch'
      | 'pengolahan'
      | 'ambil_mitra'
      | 'settlement'
      | 'home_sales'
      | 'capital'
      | 'product'
      | 'mitra'
  ) => void;
  onOpenPengolahanForBatch?: (batchId: string) => void;
}

export default function DashboardModule({
  operatingCapital,
  netProfitPool,
  totalGrossOmzet,
  purchaseBatches,
  products,
  mitras,
  sales,
  stocks = [],
  onOpenModal,
  onOpenPengolahanForBatch,
}: DashboardModuleProps) {
  const [period, setPeriod] = useState<PeriodFilter>('all');

  // Filter Sales based on Selected Period
  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return sales.filter((s) => {
      if (!s.createdAt) return true;
      const sDate = new Date(s.createdAt);

      if (period === 'today') {
        return sDate.toDateString() === todayStr;
      } else if (period === 'month') {
        return sDate.getMonth() === currentMonth && sDate.getFullYear() === currentYear;
      }
      return true;
    });
  }, [sales, period]);

  // Compute Period Metrics
  const periodOmzet = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  }, [filteredSales]);

  const periodProfit = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + (Number(s.profit) || 0), 0);
  }, [filteredSales]);

  // Top Mitra Leaderboard (Rank Top 3 Mitras in Period)
  const topMitras = useMemo(() => {
    const mitraStats: Record<string, { omzet: number; soldQty: number }> = {};

    filteredSales.forEach((s) => {
      if ((s.saleType === 'CONSIGNMENT' || s.saleType === 'MITRA') && s.mitraId) {
        if (!mitraStats[s.mitraId]) {
          mitraStats[s.mitraId] = { omzet: 0, soldQty: 0 };
        }
        mitraStats[s.mitraId].omzet += Number(s.totalAmount) || 0;
        mitraStats[s.mitraId].soldQty += Number(s.quantity) || 0;
      }
    });

    const ranked = Object.entries(mitraStats)
      .map(([mId, stat]) => {
        const mitraObj = mitras.find((m) => m.id === mId);
        return {
          mitraId: mId,
          name: mitraObj?.name || 'Mitra',
          type: mitraObj?.type || 'Warung',
          omzet: stat.omzet,
          soldQty: stat.soldQty,
        };
      })
      .sort((a, b) => b.omzet - a.omzet);

    return ranked.slice(0, 3);
  }, [filteredSales, mitras]);

  const tersediaBatchesCount = useMemo(() => {
    return purchaseBatches.filter((b) => b.status === 'tersedia').length;
  }, [purchaseBatches]);

  const totalWarehouseStock = useMemo(() => {
    return stocks
      .filter((s) => s.locationType === 'gudang')
      .reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
  }, [stocks]);

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* 1. Periode Switcher Bar */}
      <PeriodSwitcherBar period={period} setPeriod={setPeriod} />

      {/* 2. Financial Overview Card */}
      <FinancialOverviewCard
        operatingCapital={operatingCapital}
        netProfitPool={netProfitPool}
        totalGrossOmzet={totalGrossOmzet}
        periodProfit={periodProfit}
        periodOmzet={periodOmzet}
        period={period}
        onOpenCapitalModal={() => onOpenModal('capital')}
      />

      {/* 3. Quick Status Summary Bar */}
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-[10px] text-amber-800 font-bold block">Batch Belanja Tersedia:</span>
            <span className="text-sm font-black text-amber-900">{tersediaBatchesCount} Batch Siap Olah</span>
          </div>
          <span className="text-xl">📦</span>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-[10px] text-emerald-800 font-bold block">Stok Produk Jadi (Gudang):</span>
            <span className="text-sm font-black text-emerald-900">{totalWarehouseStock} Pcs Tersedia</span>
          </div>
          <span className="text-xl">🍞</span>
        </div>
      </div>

      {/* 4. Operational Action Grid */}
      <OperationalActionGrid onOpenModal={onOpenModal} />

      {/* 5. Top Mitra Leaderboard */}
      <TopMitraLeaderboard topMitras={topMitras} period={period} />

      {/* 6. Active Batches Status List */}
      <BatchStatusList
        purchaseBatches={purchaseBatches}
        products={products}
        onOpenModal={onOpenModal}
        onOpenPengolahanForBatch={onOpenPengolahanForBatch}
      />
    </div>
  );
}
