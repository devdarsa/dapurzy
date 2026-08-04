'use client';

import React, { useState, useEffect } from 'react';
import { X, Delete, Check, Calculator } from 'lucide-react';
import { formatNumberWithDots, formatRupiah } from '@/lib/utils';

interface NumericCalculatorKeypadProps {
  isOpen: boolean;
  title?: string;
  initialValue?: number | string;
  onClose: () => void;
  onConfirm: (value: number) => void;
}

export default function NumericCalculatorKeypad({
  isOpen,
  title = 'Kalkulator & Keypad Angka DAPURZY',
  initialValue = 0,
  onClose,
  onConfirm,
}: NumericCalculatorKeypadProps) {
  const [expression, setExpression] = useState<string>('');
  const [evaluatedResult, setEvaluatedResult] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      const num = typeof initialValue === 'number' ? initialValue : Number(String(initialValue).replace(/\D/g, '')) || 0;
      setExpression(num > 0 ? String(num) : '');
      setEvaluatedResult(num);
    }
  }, [isOpen, initialValue]);

  // Safe expression evaluator for calculator
  const safeEvaluate = (expr: string): number => {
    if (!expr) return 0;
    try {
      // Replace visual math symbols with standard JS operators
      const cleaned = expr.replace(/×/g, '*').replace(/÷/g, '/');
      // Evaluate basic arithmetic
      const result = Function(`"use strict"; return (${cleaned})`)();
      return typeof result === 'number' && !isNaN(result) && isFinite(result) ? Math.max(0, Math.floor(result)) : 0;
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    const res = safeEvaluate(expression);
    setEvaluatedResult(res);
  }, [expression]);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    setExpression((prev) => prev + digit);
  };

  const handleOperator = (op: string) => {
    if (!expression) return;
    const lastChar = expression.slice(-1);
    if (['+', '-', '×', '÷'].includes(lastChar)) {
      setExpression((prev) => prev.slice(0, -1) + op);
    } else {
      setExpression((prev) => prev + ` ${op} `);
    }
  };

  const handleBackspace = () => {
    setExpression((prev) => {
      if (prev.endsWith(' ')) {
        return prev.slice(0, -3);
      }
      return prev.slice(0, -1);
    });
  };

  const handleClear = () => {
    setExpression('');
    setEvaluatedResult(0);
  };

  const handleEquals = () => {
    const res = safeEvaluate(expression);
    setExpression(String(res));
  };

  const handleConfirm = () => {
    const finalVal = safeEvaluate(expression);
    onConfirm(finalVal);
    onClose();
  };

  // Format expression for display with thousands dot separators for numbers
  const formatExpressionForDisplay = (expr: string): string => {
    if (!expr) return '0';
    return expr
      .split(' ')
      .map((token) => {
        if (/^\d+$/.test(token)) {
          return formatNumberWithDots(token);
        }
        return token;
      })
      .join(' ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      />

      {/* KEYPAD BOTTOM SHEET CONTAINER */}
      <div className="relative bg-slate-900 text-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl p-4 space-y-3 border border-slate-800 z-10 animate-in slide-in-from-bottom duration-200">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-amber-400" />
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-200">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CALCULATOR DISPLAY SCREEN */}
        <div className="bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800/80 text-right space-y-1">
          <div className="text-xs text-amber-400 font-mono overflow-x-auto whitespace-nowrap min-h-[1.25rem]">
            {formatExpressionForDisplay(expression)}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
            {formatRupiah(evaluatedResult)}
          </div>
        </div>

        {/* KEYPAD GRID (NUMBERS + CALCULATOR OPERATORS) */}
        <div className="grid grid-cols-4 gap-2 text-sm sm:text-base font-bold">
          {/* Row 1: Clear, Div, Mult, Backspace */}
          <button
            onClick={handleClear}
            className="py-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 active:scale-95 transition cursor-pointer"
          >
            C
          </button>
          <button
            onClick={() => handleOperator('÷')}
            className="py-3 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/60 active:scale-95 transition cursor-pointer"
          >
            ÷
          </button>
          <button
            onClick={() => handleOperator('×')}
            className="py-3 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/60 active:scale-95 transition cursor-pointer"
          >
            ×
          </button>
          <button
            onClick={handleBackspace}
            className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center active:scale-95 transition cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>

          {/* Row 2: 7, 8, 9, Minus */}
          <button
            onClick={() => handleDigit('7')}
            className="py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 text-white active:scale-95 transition cursor-pointer border border-slate-700/60"
          >
            7
          </button>
          <button
            onClick={() => handleDigit('8')}
            className="py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 text-white active:scale-95 transition cursor-pointer border border-slate-700/60"
          >
            8
          </button>
          <button
            onClick={() => handleDigit('9')}
            className="py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 text-white active:scale-95 transition cursor-pointer border border-slate-700/60"
          >
            9
          </button>
          <button
            onClick={() => handleOperator('-')}
            className="py-3 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/60 active:scale-95 transition cursor-pointer"
          >
            -
          </button>

          {/* Row 3: 4, 5, 6, Plus */}
          <button
            onClick={() => handleDigit('4')}
            className="py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 text-white active:scale-95 transition cursor-pointer border border-slate-700/60"
          >
            4
          </button>
          <button
            onClick={() => handleDigit('5')}
            className="py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 text-white active:scale-95 transition cursor-pointer border border-slate-700/60"
          >
            5
          </button>
          <button
            onClick={() => handleDigit('6')}
            className="py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 text-white active:scale-95 transition cursor-pointer border border-slate-700/60"
          >
            6
          </button>
          <button
            onClick={() => handleOperator('+')}
            className="py-3 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/60 active:scale-95 transition cursor-pointer"
          >
            +
          </button>

          {/* Row 4: 1, 2, 3, Equals */}
          <button
            onClick={() => handleDigit('1')}
            className="py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 text-white active:scale-95 transition cursor-pointer border border-slate-700/60"
          >
            1
          </button>
          <button
            onClick={() => handleDigit('2')}
            className="py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 text-white active:scale-95 transition cursor-pointer border border-slate-700/60"
          >
            2
          </button>
          <button
            onClick={() => handleDigit('3')}
            className="py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 text-white active:scale-95 transition cursor-pointer border border-slate-700/60"
          >
            3
          </button>
          <button
            onClick={handleEquals}
            className="py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-600 active:scale-95 transition cursor-pointer"
          >
            =
          </button>

          {/* Row 5: 0, 00, 000 */}
          <button
            onClick={() => handleDigit('0')}
            className="py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 text-white active:scale-95 transition cursor-pointer border border-slate-700/60"
          >
            0
          </button>
          <button
            onClick={() => handleDigit('00')}
            className="py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 text-white active:scale-95 transition cursor-pointer border border-slate-700/60"
          >
            00
          </button>
          <button
            onClick={() => handleDigit('000')}
            className="col-span-2 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 text-white active:scale-95 transition cursor-pointer border border-slate-700/60 font-black text-amber-400"
          >
            .000 (Ribuan)
          </button>
        </div>

        {/* CONFIRM BUTTON */}
        <button
          onClick={handleConfirm}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 rounded-2xl shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition cursor-pointer text-sm sm:text-base mt-2"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>Gunakan Nominal ({formatRupiah(evaluatedResult)})</span>
        </button>
      </div>
    </div>
  );
}
