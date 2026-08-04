'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  HelpCircle,
} from 'lucide-react';
import {
  toast,
  ToastOptions,
  ConfirmOptions,
  ActiveToast,
  ActiveConfirm,
  ToastType,
} from '@/lib/toast';

export default function NotificationProvider({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);
  const [activeConfirm, setActiveConfirm] = useState<ActiveConfirm | null>(null);

  // --- TOAST SUBSCRIPTION ---
  useEffect(() => {
    const unsubToast = toast.onToast((opts: ToastOptions) => {
      const id = opts.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const type: ToastType = opts.type || 'info';
      const defaultTitle =
        type === 'success'
          ? 'Berhasil'
          : type === 'error'
          ? 'Gagal'
          : type === 'warning'
          ? 'Peringatan'
          : 'Informasi';

      const newToast: ActiveToast = {
        id,
        title: opts.title || defaultTitle,
        message: opts.message,
        type,
        duration: opts.duration || 3800,
        createdAt: Date.now(),
      };

      setToasts((prev) => [newToast, ...prev].slice(0, 4)); // Max 4 visible toasts
    });

    const unsubDismiss = toast.onDismiss((id?: string) => {
      if (id) {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      } else {
        setToasts([]);
      }
    });

    return () => {
      unsubToast();
      unsubDismiss();
    };
  }, []);

  // Auto dismiss toasts
  useEffect(() => {
    if (toasts.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setToasts((prev) => prev.filter((t) => now - t.createdAt < t.duration));
    }, 200);

    return () => clearInterval(interval);
  }, [toasts]);

  // --- CONFIRM SUBSCRIPTION ---
  useEffect(() => {
    const unsubConfirm = toast.onConfirm((options: ConfirmOptions, resolve: (v: boolean) => void) => {
      const id = options.id || `confirm-${Date.now()}`;
      setActiveConfirm({ id, options, resolve });
    });

    return () => {
      unsubConfirm();
    };
  }, []);

  const handleConfirmAction = useCallback(
    (confirmed: boolean) => {
      if (!activeConfirm) return;
      const { options, resolve } = activeConfirm;
      if (confirmed) {
        options.onConfirm?.();
        resolve(true);
      } else {
        options.onCancel?.();
        resolve(false);
      }
      setActiveConfirm(null);
    },
    [activeConfirm]
  );

  // Keyboard shortcut for Confirm Modal
  useEffect(() => {
    if (!activeConfirm) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleConfirmAction(false);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirmAction(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeConfirm, handleConfirmAction]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      {children}

      {/* --- TOAST CONTAINER (TOP FLOATING) --- */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] flex flex-col items-center gap-2.5 w-full max-w-sm sm:max-w-md px-4 pointer-events-none">
        {toasts.map((t) => {
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';
          const isSuccess = t.type === 'success';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto w-full relative overflow-hidden rounded-2xl p-3.5 sm:p-4 text-white shadow-2xl backdrop-blur-xl border transition-all duration-300 transform animate-in fade-in slide-in-from-top-4 flex items-start gap-3 ${
                isSuccess
                  ? 'bg-slate-900/95 border-emerald-500/40 shadow-emerald-950/40 text-emerald-100'
                  : isError
                  ? 'bg-slate-900/95 border-rose-500/40 shadow-rose-950/40 text-rose-100'
                  : isWarning
                  ? 'bg-slate-900/95 border-amber-500/40 shadow-amber-950/40 text-amber-100'
                  : 'bg-slate-900/95 border-cyan-500/40 shadow-cyan-950/40 text-cyan-100'
              }`}
            >
              {/* ICON BADGE */}
              <div
                className={`p-2 rounded-xl flex-shrink-0 flex items-center justify-center ${
                  isSuccess
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isError
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : isWarning
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}
              >
                {isSuccess ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isError ? (
                  <AlertCircle className="w-5 h-5" />
                ) : isWarning ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>

              {/* MESSAGE & TITLE */}
              <div className="flex-1 min-w-0 pr-2 pt-0.5">
                <p className="text-[11px] font-black uppercase tracking-wider opacity-85 leading-none mb-1">
                  {t.title}
                </p>
                <p className="text-xs sm:text-sm font-semibold leading-tight text-slate-100 break-words">
                  {t.message}
                </p>
              </div>

              {/* CLOSE BUTTON */}
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>

              {/* COUNTDOWN PROGRESS BAR */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/60 overflow-hidden">
                <div
                  className={`h-full transition-all ease-linear ${
                    isSuccess
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : isError
                      ? 'bg-gradient-to-r from-rose-500 to-red-400'
                      : isWarning
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-400'
                  }`}
                  style={{
                    animation: `toast-progress ${t.duration}ms linear forwards`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* --- CONFIRM DIALOG MODAL --- */}
      {activeConfirm && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="bg-slate-900 border border-slate-700/80 text-slate-100 rounded-3xl p-5 sm:p-6 max-w-sm sm:max-w-md w-full shadow-2xl space-y-4 scale-in-95 animate-in duration-200 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* AMBIENT BACKGROUND GLOW */}
            <div
              className={`absolute -top-16 -left-16 w-36 h-36 rounded-full blur-3xl opacity-30 ${
                activeConfirm.options.variant === 'danger'
                  ? 'bg-rose-500'
                  : activeConfirm.options.variant === 'info'
                  ? 'bg-cyan-500'
                  : activeConfirm.options.variant === 'success'
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              }`}
            />

            {/* HEADER ICON & TITLE */}
            <div className="flex items-start gap-3.5 relative z-10">
              <div
                className={`p-3 rounded-2xl flex-shrink-0 flex items-center justify-center ${
                  activeConfirm.options.variant === 'danger'
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    : activeConfirm.options.variant === 'info'
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                    : activeConfirm.options.variant === 'success'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}
              >
                {activeConfirm.options.variant === 'danger' ? (
                  <AlertCircle className="w-6 h-6" />
                ) : activeConfirm.options.variant === 'info' ? (
                  <Info className="w-6 h-6" />
                ) : activeConfirm.options.variant === 'success' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  {activeConfirm.options.title || 'Konfirmasi Tindakan'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1 font-medium">
                  {activeConfirm.options.message}
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-2.5 pt-2 relative z-10">
              <button
                type="button"
                onClick={() => handleConfirmAction(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold transition text-xs sm:text-sm cursor-pointer border border-slate-700 text-center"
              >
                {activeConfirm.options.cancelText || 'Batal'}
              </button>

              <button
                type="button"
                onClick={() => handleConfirmAction(true)}
                className={`flex-1 py-2.5 px-4 rounded-xl active:scale-95 text-white font-extrabold shadow-lg transition text-xs sm:text-sm cursor-pointer text-center ${
                  activeConfirm.options.variant === 'danger'
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-950/60'
                    : activeConfirm.options.variant === 'info'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-950/60'
                    : activeConfirm.options.variant === 'success'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/60'
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-950/60'
                }`}
              >
                {activeConfirm.options.confirmText || 'Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes toast-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </>
  );
}
