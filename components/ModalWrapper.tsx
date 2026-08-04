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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl max-h-[88vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 border border-slate-200">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
          <h3 className="font-extrabold text-xs sm:text-sm text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Tutup Dialog"
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
