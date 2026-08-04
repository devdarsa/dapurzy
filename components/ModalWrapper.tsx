'use client';

import React from 'react';
import { X } from 'lucide-react';

export interface ModalWrapperProps {
  title: string;
  onClose: () => void;
  children?: React.ReactNode;
}

export default function ModalWrapper({ title, onClose, children }: ModalWrapperProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-300 overflow-x-hidden">
      <div className="bg-white w-full max-w-md sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 space-y-3.5 shadow-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300 ease-out border border-slate-200/90 relative mb-0 pb-8 sm:pb-6">
        {/* MOBILE HANDLE BAR */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-1 sm:hidden cursor-pointer" onClick={onClose} />

        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-black text-sm sm:text-base text-slate-800 tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Tutup Dialog"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 transition cursor-pointer active:scale-95"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
        <div className="pt-1">{children}</div>
      </div>
    </div>
  );
}

