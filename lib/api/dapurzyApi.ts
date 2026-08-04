/**
 * Dapurzy Client-side API Service Layer
 * Centralized API calls for clean modular architecture.
 */

export async function fetchSyncData() {
  const res = await fetch('/api/sync');
  if (!res.ok) throw new Error('Gagal memuat data dari database.');
  return await res.json();
}

export async function postCapital(data: { id: string; trxNumber: string; amount: number; note: string; type: string }) {
  const res = await fetch('/api/capital', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function deleteCapitalLog(logId: string) {
  const res = await fetch(`/api/capital?id=${logId}`, { method: 'DELETE' });
  return await res.json();
}

export async function postBelanjaBatch(data: { id: string; batchId: string; itemsDescription: string; totalCost: number; date: string; supplier?: string }) {
  const res = await fetch('/api/purchases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function putPengolahan(data: { batchId: string; productId: string; producedQty: number; calculatedHpp: number }) {
  const res = await fetch('/api/purchases', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function postAmbilMitra(data: any) {
  const res = await fetch('/api/movements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function postSale(data: any) {
  const res = await fetch('/api/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function postProduct(data: { id: string; name: string; category: string; price: number; avgHpp: number }) {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function deleteProduct(productId: string) {
  const res = await fetch(`/api/products?id=${productId}`, { method: 'DELETE' });
  return await res.json();
}

export async function postMitra(data: { id: string; name: string; type: string; whatsapp: string; address: string; customPrices: any }) {
  const res = await fetch('/api/mitras', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function deleteMitra(mitraId: string) {
  const res = await fetch(`/api/mitras?id=${mitraId}`, { method: 'DELETE' });
  return await res.json();
}

export async function postFactoryReset() {
  const res = await fetch('/api/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: 'DAPURZY-RESET-2026' }),
  });
  return await res.json();
}
