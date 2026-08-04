'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('DAPURZY ServiceWorker registered: ', registration.scope);
          },
          (err) => {
            console.log('DAPURZY ServiceWorker registration failed: ', err);
          }
        );
      });
    }
  }, []);

  return null;
}
