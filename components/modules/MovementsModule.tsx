'use client';

import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface MovementsModuleProps {
  transactions: any[];
  onOpenMovementModal: () => void;
  onOpenSettlementModal: () => void;
}

export default function MovementsModule({
  transactions,
  onOpenMovementModal,
  onOpenSettlementModal,
}: MovementsModuleProps) {
  const movementTrxs = transactions.filter((t) => t.type === 'PERGERAKAN');

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-800">Pergerakan & Konsinyasi Barang</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Transfer Gudang <span className="text-emerald-600 font-bold">⇄</span> Mitra & Settlement Laku
          </p>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={onOpenSettlementModal}
            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Laku & Retur Mitra</span>
          </button>

          <button
            onClick={onOpenMovementModal}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
            <span>Titip Stok</span>
          </button>
        </div>
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        {movementTrxs.map((trx) => (
          <div key={trx.id} className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[9px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {trx.title}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400">{formatDate(trx.date)}</span>
            </div>
            <p className="font-bold text-xs sm:text-sm text-slate-800 mt-1">{trx.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
