'use client';

import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ToastProps {
  notification: { message: string; type: 'success' | 'error' } | null;
}

export default function Toast({ notification }: ToastProps) {
  if (!notification) return null;

  return (
    <div
      className={`fixed top-3 left-1/2 -translate-x-1/2 z-[100] px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-xl text-[11px] sm:text-xs font-medium flex items-center space-x-2 text-white animate-bounce max-w-[88%] sm:max-w-md ${
        notification.type === 'error' ? 'bg-rose-600' : 'bg-emerald-700'
      }`}
    >
      {notification.type === 'error' ? (
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
      ) : (
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
      )}
      <span className="leading-tight">{notification.message}</span>
    </div>
  );
}
