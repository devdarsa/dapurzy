/**
 * DAPURZY Real-time Native Smartphone Notification Engine
 * Sends Push Notifications & Hourly Alerts for Low Stock & Raw Material Purchase Recommendations.
 */

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.log('Notifications not supported in this browser environment.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendLowStockNotification(
  productName: string,
  currentStock: number,
  recommendedBahan: string
) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    const title = `⚠️ DAPURZY: Stok ${productName} Menipis (${currentStock} pcs)!`;
    const options: NotificationOptions = {
      body: `💡 Rekomendasi Belanja Bahan Pokok: ${recommendedBahan}`,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: `low-stock-${productName}`,
      requireInteraction: true,
    };

    try {
      new Notification(title, options);
    } catch (e) {
      console.log('Push notification execution error:', e);
    }
  }
}

/**
 * Recommended Raw Material Ingredients Mapping per Product Category
 */
export function getRecommendedIngredients(category: string, productName: string): string {
  const catLower = (category || '').toLowerCase();
  const nameLower = (productName || '').toLowerCase();

  if (catLower.includes('lilin') || nameLower.includes('es')) {
    return 'Susu Kental Manis, Cokelat Bubuk, Buah Segar, Gula Pasir, Plastik Es Lilin & Tali';
  } else if (catLower.includes('udang') || catLower.includes('keju') || nameLower.includes('keju')) {
    return 'Daging Udang Fresh, Keju Mozzarella/Cheddar, Tepung Panir, Bumbu Rempah & Minyak Goreng';
  } else if (catLower.includes('bakso') || nameLower.includes('bakso')) {
    return 'Daging Sapi Segar, Tepung Tapioka, Bawang Putih, Tusuk Sate & Bumbu Kacang/Kecap';
  } else if (catLower.includes('dimsum') || nameLower.includes('dimsum')) {
    return 'Daging Ayam/Udang, Kulit Dimsum, Wortel Parut, Minyak Wijen & Saus Sambal Dimsum';
  } else {
    return 'Bahan Utama Olahan Dapur, Bumbu Pelengkap & Kemasan Pembungkus Produk';
  }
}
