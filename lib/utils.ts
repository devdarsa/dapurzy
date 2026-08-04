import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number to Indonesian Rupiah currency format
 * @example formatRupiah(15000) => "Rp 15.000"
 */
export function formatRupiah(number: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number || 0);
}

/**
 * Real-time Thousands Dot Separator for Input Fields
 * @example formatNumberWithDots(200000) => "200.000"
 */
export function formatNumberWithDots(val: number | string): string {
  if (val === undefined || val === null || val === '') return '';
  const cleanNumber = String(val).replace(/\D/g, '');
  if (!cleanNumber) return '';
  return new Intl.NumberFormat('id-ID').format(Number(cleanNumber));
}

/**
 * Parses thousands dot separated string back to raw number
 * @example parseFormattedNumber("200.000") => 200000
 */
export function parseFormattedNumber(val: string): number {
  if (!val) return 0;
  const cleanNumber = String(val).replace(/\D/g, '');
  return Number(cleanNumber) || 0;
}

/**
 * Formats ISO date string to Indonesian human-readable string
 */
export function formatDate(isoString?: string): string {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Automated Precision HPP Calculator (Ceiling Rounding UP to Nearest 100)
 * Formula: Math.ceil((Total Batch Cost / Produced Quantity) / 100) * 100
 * Rounding UP to nearest hundred rupiah (Ratusan Ke Atas), eliminating all units & tens.
 */
export function calculatePrecisionHpp(totalCost: number, producedQty: number): number {
  if (producedQty <= 0) return 0;
  const rawHpp = totalCost / producedQty;
  return Math.ceil(rawHpp / 100) * 100;
}

/**
 * Automatic Profit Calculator for Sales Transaction
 * Formula: (Quantity * Price Per Unit) - (Quantity * HPP Per Unit)
 */
export function calculateTransactionProfit(quantity: number, pricePerUnit: number, hppPerUnit: number): number {
  const totalAmount = quantity * pricePerUnit;
  const totalHpp = quantity * hppPerUnit;
  return totalAmount - totalHpp;
}
