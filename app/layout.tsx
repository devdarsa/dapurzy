import type { Metadata, Viewport } from 'next';
import './globals.css';
import PwaRegister from '@/components/PwaRegister';

export const metadata: Metadata = {
  title: 'DAPURZY - Batch HPP & Consignment Management System',
  description: 'Aplikasi Manajemen HPP Presisi Berbasis Batch & Multi-Lokasi Konsinyasi untuk Usaha Rumahan.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DAPURZY',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#064e3b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased selection:bg-emerald-500 selection:text-white">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
