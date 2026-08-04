'use client';

import React, { useRef } from 'react';
import {
  FileText,
  Share2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShieldCheck,
  ImageIcon,
} from 'lucide-react';
import { PurchaseBatch, Product, AuditLog, Mitra } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/utils';

interface TraceabilityModuleProps {
  cashBalance: number;
  activeCapital: number;
  stockValuation: number;
  todayStats: {
    omzet: number;
    laba: number;
    pengeluaran: number;
  };
  purchaseBatches: PurchaseBatch[];
  products: Product[];
  mitras: Mitra[];
  auditLogs: AuditLog[];
  transactions: any[];
}

export default function TraceabilityModule({
  cashBalance,
  activeCapital,
  stockValuation,
  todayStats,
  purchaseBatches,
  products,
  auditLogs,
  transactions,
}: TraceabilityModuleProps) {
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Calculations for Laba Modal
  const totalModalValue = cashBalance + stockValuation;

  // 2. Calculations for Laba Untung
  const totalOmzetAccum = transactions
    .filter((t) => t.type === 'PENJUALAN')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalProfitAccum = transactions
    .filter((t) => t.type === 'PENJUALAN')
    .reduce((sum, t) => sum + (t.profit || 0), 0);

  const profitMarginPercent =
    totalOmzetAccum > 0 ? Math.round((totalProfitAccum / totalOmzetAccum) * 100) : 0;

  // 3. Calculations for Laba Rugi / Belanja
  const totalBelanjaAccum = transactions
    .filter((t) => t.type === 'BELANJA')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Generate Professional Ultra-HD Financial Report Image & Direct Share to WhatsApp
  const generateAndShareReportImage = async () => {
    const canvas = hiddenCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    // Background Gradient (Luxury Dark Emerald)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#064e3b');
    bgGrad.addColorStop(0.5, '#022c22');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative Luxury Outer Frame Border (Gold)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, width - 12, height - 12);

    // Header Title Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.fillRect(50, 45, width - 100, 140);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 45, width - 100, 140);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 40px system-ui, -apple-system, sans-serif';
    ctx.fillText('DAPURZY v1.2 FINANCIAL AUDIT REPORT', 80, 102);

    const currentDateStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '22px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Official Business Audit • Tanggal: ${currentDateStr}`, 80, 150);

    // Helper Card Box Drawer
    const drawCardBox = (
      x: number,
      y: number,
      w: number,
      h: number,
      title: string,
      colorHex: string,
      items: { label: string; value: string; isBold?: boolean }[]
    ) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 18);
      ctx.fill();

      // Card Header Ribbon
      ctx.fillStyle = colorHex;
      ctx.beginPath();
      ctx.roundRect(x, y, w, 58, [18, 18, 0, 0]);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
      ctx.fillText(title, x + 20, y + 38);

      // Card Content Lines
      let lineY = y + 102;
      items.forEach((item) => {
        ctx.fillStyle = '#475569';
        ctx.font = '21px system-ui, -apple-system, sans-serif';
        ctx.fillText(item.label, x + 20, lineY);

        ctx.fillStyle = item.isBold ? colorHex : '#0f172a';
        ctx.font = item.isBold
          ? 'bold 24px system-ui, -apple-system, sans-serif'
          : 'bold 21px system-ui, -apple-system, sans-serif';
        const textWidth = ctx.measureText(item.value).width;
        ctx.fillText(item.value, x + w - 20 - textWidth, lineY);

        lineY += 46;
      });
    };

    // SECTION 1: LABA MODAL (Left Top)
    drawCardBox(50, 215, 470, 310, '1. AUDIT LABA MODAL', '#059669', [
      { label: 'Saldo Kas Operasional:', value: formatRupiah(cashBalance) },
      { label: 'Modal Aktif Usaha:', value: formatRupiah(activeCapital) },
      { label: 'Valuasi Stok Barang:', value: formatRupiah(stockValuation) },
      { label: 'Total Aset Modal:', value: formatRupiah(totalModalValue), isBold: true },
    ]);

    // SECTION 2: LABA UNTUNG (Right Top)
    drawCardBox(560, 215, 470, 310, '2. AUDIT LABA UNTUNG', '#d97706', [
      { label: 'Omzet Hari Ini:', value: formatRupiah(todayStats.omzet) },
      { label: 'Laba Bersih Hari Ini:', value: formatRupiah(todayStats.laba) },
      { label: 'Total Akumulasi Laba:', value: formatRupiah(totalProfitAccum) },
      { label: 'Margin Keuntungan:', value: `${profitMarginPercent}%`, isBold: true },
    ]);

    // SECTION 3: LABA RUGI / BELANJA (Bottom Wide)
    drawCardBox(50, 550, 980, 255, '3. AUDIT LABA RUGI / BELANJA MODAL', '#dc2626', [
      { label: 'Pengeluaran Belanja Hari Ini:', value: formatRupiah(todayStats.pengeluaran) },
      { label: 'Total Akumulasi Belanja Modal:', value: formatRupiah(totalBelanjaAccum) },
      { label: 'Total Batch Belanja Bahan Baku:', value: `${purchaseBatches.length} Batch`, isBold: true },
    ]);

    // SECTION 4: PRODUCT STOCK & HPP SUMMARY (Bottom Wide 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    ctx.beginPath();
    ctx.roundRect(50, 830, 980, 390, 18);
    ctx.fill();

    ctx.fillStyle = '#4c1d95';
    ctx.beginPath();
    ctx.roundRect(50, 830, 980, 58, [18, 18, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillText('4. RINGKASAN MASTER PRODUK & HPP TERKALKULASI', 70, 868);

    let prodY = 930;
    products.forEach((p, idx) => {
      if (idx < 6) {
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 21px system-ui, -apple-system, sans-serif';
        ctx.fillText(`• ${p.name}`, 70, prodY);

        ctx.fillStyle = '#059669';
        ctx.font = 'bold 21px system-ui, -apple-system, sans-serif';
        const valStr = `Harga: ${formatRupiah(p.price)} | HPP Auto: ${formatRupiah(p.avgHpp)}`;
        const wVal = ctx.measureText(valStr).width;
        ctx.fillText(valStr, 1000 - wVal, prodY);

        prodY += 44;
      }
    });

    // FOOTER WATERMARK
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 19px system-ui, -apple-system, sans-serif';
    ctx.fillText('Generated automatically by DAPURZY PWA Management System Engine', 50, 1260);

    // Convert Canvas to Blob & File for Direct 1-Tap WhatsApp Image Share
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], `Laporan_Audit_DAPURZY_${Date.now()}.png`, { type: 'image/png' });

      // Direct Web Share API (Triggers Native Share Sheet directly to WhatsApp with PNG Attached!)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Laporan Audit DAPURZY',
            text: 'Berikut Gambar Laporan Audit Keuangan DAPURZY v1.2',
          });
          return;
        } catch (e) {
          console.log('Share Sheet opened or canceled');
        }
      }

      // Fallback if Web Share API is not active: trigger download and open WA app
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = `Laporan_Audit_DAPURZY_${Date.now()}.png`;
      downloadLink.click();

      const waNativeUrl = `whatsapp://send?text=${encodeURIComponent(
        'Berikut Laporan Audit Keuangan DAPURZY v1.2'
      )}`;
      window.location.href = waNativeUrl;
    }, 'image/png');
  };

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-200">
      {/* Hidden Canvas Element for Image Generation */}
      <canvas ref={hiddenCanvasRef} className="hidden" />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-600" /> Laporan Audit Keuangan & Traceability
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-500">
            Analisis Laba Modal, Laba Untung, Laba Rugi & Share WA Gambar HD
          </p>
        </div>
      </div>

      {/* 3 CORE FINANCIAL AUDIT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
        {/* CARD 1: LABA MODAL */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <h3 className="font-extrabold text-[11px] text-emerald-800 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> 1. Audit Laba Modal
            </h3>
            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
              Aset Liquid
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Saldo Kas Operasional:</span>
              <span className="font-bold text-slate-800">{formatRupiah(cashBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Modal Aktif Usaha:</span>
              <span className="font-bold text-slate-800">{formatRupiah(activeCapital)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Valuasi Stok Barang:</span>
              <span className="font-bold text-amber-600">{formatRupiah(stockValuation)}</span>
            </div>
            <div className="pt-1 border-t border-slate-100 flex justify-between font-black text-emerald-700 text-xs">
              <span>Total Aset Modal:</span>
              <span>{formatRupiah(totalModalValue)}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: LABA UNTUNG */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <h3 className="font-extrabold text-[11px] text-amber-800 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" /> 2. Audit Laba Untung
            </h3>
            <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
              Margin {profitMarginPercent}%
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Omzet Hari Ini:</span>
              <span className="font-bold text-slate-800">{formatRupiah(todayStats.omzet)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Laba Bersih Hari Ini:</span>
              <span className="font-bold text-emerald-600">{formatRupiah(todayStats.laba)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Akumulasi Omzet:</span>
              <span className="font-bold text-slate-800">{formatRupiah(totalOmzetAccum)}</span>
            </div>
            <div className="pt-1 border-t border-slate-100 flex justify-between font-black text-amber-600 text-xs">
              <span>Total Laba Bersih:</span>
              <span>{formatRupiah(totalProfitAccum)}</span>
            </div>
          </div>
        </div>

        {/* CARD 3: LABA RUGI / BELANJA */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <h3 className="font-extrabold text-[11px] text-rose-800 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" /> 3. Audit Laba Rugi / Belanja
            </h3>
            <span className="text-[9px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded">
              Pengeluaran
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Belanja Hari Ini:</span>
              <span className="font-bold text-rose-600">{formatRupiah(todayStats.pengeluaran)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Akumulasi Belanja:</span>
              <span className="font-bold text-slate-800">{formatRupiah(totalBelanjaAccum)}</span>
            </div>
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>Audit HPP Batch:</span>
              <span>{purchaseBatches.length} Batch Belanja</span>
            </div>
            <div className="pt-1 border-t border-slate-100 flex justify-between font-bold text-rose-600 text-xs">
              <span>Beban Modal:</span>
              <span>{formatRupiah(totalBelanjaAccum)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* REFINED CLEAN WHATSAPP DIRECT HIGH-RES IMAGE GENERATOR BANNER */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-emerald-600" /> Direct Share GAMBAR Laporan Audit ke WA
          </h3>
          <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
            HD PNG 1080x1350
          </span>
        </div>

        <p className="text-[11px] text-slate-600 leading-relaxed">
          Tekan tombol di bawah untuk secara otomatis membuat Gambar Laporan Keuangan HD bernuansa mewah, lalu langsung mengarahkan Anda ke aplikasi WhatsApp di ponsel dengan file gambar terlampir secara instan.
        </p>

        <button
          onClick={generateAndShareReportImage}
          className="w-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-xs flex items-center justify-center space-x-2 active:scale-95 transition cursor-pointer"
        >
          <Share2 className="w-4 h-4 stroke-[2.5]" />
          <span>Buka Aplikasi WA & Kirim Gambar Laporan Audit</span>
        </button>
      </div>

      {/* AUDIT TRAIL LOG LIST */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Log Audit Trail Sistem (Immutable)
        </h3>

        <div className="space-y-1.5 text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start justify-between">
              <div>
                <span className="font-mono text-[9px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded">
                  {log.action}
                </span>
                <p className="font-bold text-slate-800 text-[11px] mt-0.5">{log.details}</p>
                <p className="text-[9px] font-mono text-slate-400">Ref: {log.trxNumber}</p>
              </div>
              <span className="text-[9px] text-slate-400">{formatDate(log.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
