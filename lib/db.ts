/**
 * Shared D1 Database accessor untuk Cloudflare Edge Runtime.
 * Mengambil D1 DB binding dari berbagai lokasi yang mungkin di edge environment.
 * Digunakan oleh semua API route agar tidak ada duplikasi kode.
 */
export function getDB(request: Request): any {
  const env = (process as any).env || {};
  const reqEnv = (request as any).env || (request as any).cf?.env || {};
  const globEnv = (globalThis as any).env || (globalThis as any) || {};

  return (
    env.DB ||
    reqEnv.DB ||
    globEnv.DB ||
    (globalThis as any).__D1_DB ||
    null
  );
}
