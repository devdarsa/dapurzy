'use client';

import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, AlertCircle } from 'lucide-react';

interface PinLockScreenProps {
  correctPin?: string; // Default: '250420'
  onUnlockSuccess: () => void;
}

export default function PinLockScreen({
  correctPin = '250420',
  onUnlockSuccess,
}: PinLockScreenProps) {
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleKeyPress = (num: string) => {
    if (enteredPin.length < 6) {
      const nextPin = enteredPin + num;
      setEnteredPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 6) {
        if (nextPin === correctPin) {
          onUnlockSuccess();
        } else {
          setErrorMsg('PIN Salah! Silakan coba lagi.');
          setTimeout(() => setEnteredPin(''), 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
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
            <h1 className="font-extrabold text-lg sm:text-xl text-white tracking-wide">
              DAPURZY <span className="text-amber-400 text-xs">v1.2</span>
            </h1>
            <p className="text-xs text-emerald-200 font-medium">Sistem Keamanan Akses PIN</p>
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

          {errorMsg ? (
            <p className="text-xs font-bold text-rose-400 flex items-center justify-center gap-1 animate-bounce">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </p>
          ) : (
            <p className="text-[11px] text-slate-400">Masukkan 6-Digit PIN Keamanan (Default: 250420)</p>
          )}
        </div>

        {/* NUMERIC KEYPAD GRID */}
        <div className="grid grid-cols-3 gap-2.5 px-3 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-amber-400 active:text-amber-950 text-white font-extrabold text-xl shadow-xs transition active:scale-95 cursor-pointer border border-white/10"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer border border-slate-700"
          >
            C
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-amber-400 active:text-amber-950 text-white font-extrabold text-xl shadow-xs transition active:scale-95 cursor-pointer border border-white/10"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer border border-slate-700 flex items-center justify-center"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
