/**
 * DAPURZY Native Smartphone OS Push Notification Engine
 * Sends Push Notifications directly to Android & iOS System Notification Shade & Lock Screen
 * via PWA Service Worker (showNotification).
 */

export async function registerServiceWorkerAndRequestPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // 1. Register PWA Service Worker
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('PWA Service Worker registered successfully for Smartphone OS Notifications.');
    } catch (e) {
      console.log('Service worker registration error:', e);
    }
  }

  // 2. Request OS System Notification Permission
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  }

  return false;
}

export async function sendLowStockNotification(
  productName: string,
  currentStock: number,
  recommendedBahan: string
) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    const title = `⚠️ DAPURZY: Stok ${productName} Menipis (${currentStock} pcs)!`;
    const bodyText = `💡 Rekomendasi Belanja Bahan Pokok: ${recommendedBahan}`;

    // Try Service Worker System Push Notification (Pops on Smartphone Lockscreen & Status Bar)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          body: bodyText,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          vibrate: [300, 100, 300, 100, 300],
          tag: `low-stock-${productName}`,
          renotify: true,
          requireInteraction: true,
          data: { url: '/' },
        } as any);
        return;
      } catch (e) {
        console.log('SW notification fallback to Standard Notification API', e);
      }
    }

    // Standard Fallback Notification
    try {
      new Notification(title, {
        body: bodyText,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: `low-stock-${productName}`,
      });
    } catch (e) {
      console.log('Notification fallback error:', e);
    }
  }
}


