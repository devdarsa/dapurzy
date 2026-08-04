'use client';

import React, { useState } from 'react';
import { Lock, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';

interface PinLockScreenProps {
  onUnlockSuccess: (pin: string) => void;
}

export default function PinLockScreen({ onUnlockSuccess }: PinLockScreenProps) {
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const verifyPinWithDatabase = async (pin: string) => {
    setIsVerifying(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const json = await res.json();
      if (json.valid) {
        onUnlockSuccess(pin);
      } else {
        setErrorMsg('PIN Salah! Silakan Coba Lagi.');
        setTimeout(() => setEnteredPin(''), 600);
      }
    } catch (e) {
      setErrorMsg('Gagal terhubung ke Database. Periksa koneksi internet Anda dan coba lagi.');
      setTimeout(() => setEnteredPin(''), 600);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (num: string) => {
    if (isVerifying || enteredPin.length >= 6) return;

    const nextPin = enteredPin + num;
    setEnteredPin(nextPin);
    setErrorMsg('');

    if (nextPin.length === 6) {
      verifyPinWithDatabase(nextPin);
    }
  };

  const handleBackspace = () => {
    if (isVerifying) return;
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    if (isVerifying) return;
    setEnteredPin('');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 text-white flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xs sm:max-w-sm space-y-5 text-center">
        {/* LOGO & TITLE */}
        <div className="flex flex-col items-center space-y-2">
          <div className="relative">
            <img
              src="/logo.png"
              alt="DAPURZY Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-xl border-2 border-amber-400"
            />
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 p-1 rounded-full shadow">
              <Lock className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>

          <div>
            <h1 className="font-extrabold text-lg sm:text-xl text-white tracking-wide flex items-center justify-center gap-1.5">
              DAPURZY{' '}
              <span className="text-[9px] bg-emerald-500 text-emerald-950 font-black px-1.5 py-0.5 rounded uppercase">
                LIVE PRODUCTION
              </span>
            </h1>
            <p className="text-xs text-emerald-200 font-medium">Verifikasi Keamanan D1 Database Remote</p>
          </div>
        </div>

        {/* PIN DOTS DISPLAY */}
        <div className="space-y-2">
          <div className="flex justify-center items-center space-x-3 py-2">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  index < enteredPin.length
                    ? 'bg-amber-400 border-amber-400 scale-110 shadow-md'
                    : 'border-slate-500 bg-slate-800/60'
                }`}
              />
            ))}
          </div>

          {isVerifying ? (
            <p className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Memverifikasi PIN ke Database Remote...</span>
            </p>
          ) : errorMsg ? (
            <p className="text-xs font-bold text-rose-400 flex items-center justify-center gap-1 animate-bounce">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </p>
          ) : (
            <p className="text-[11px] font-bold text-amber-300 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Masukkan 6-Digit PIN Keamanan Akun Anda</span>
            </p>
          )}
        </div>

        {/* NUMERIC KEYPAD GRID */}
        <div className="grid grid-cols-3 gap-2.5 px-3 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              disabled={isVerifying}
              onClick={() => handleKeyPress(num)}
              className="py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-amber-400 active:text-amber-950 text-white font-extrabold text-xl shadow-xs transition active:scale-95 cursor-pointer border border-white/10 disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          <button
            disabled={isVerifying}
            onClick={handleClear}
            className="py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer border border-slate-700 disabled:opacity-50"
          >
            C
          </button>
          <button
            disabled={isVerifying}
            onClick={() => handleKeyPress('0')}
            className="py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-amber-400 active:text-amber-950 text-white font-extrabold text-xl shadow-xs transition active:scale-95 cursor-pointer border border-white/10 disabled:opacity-50"
          >
            0
          </button>
          <button
            disabled={isVerifying}
            onClick={handleBackspace}
            className="py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer border border-slate-700 flex items-center justify-center disabled:opacity-50"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
