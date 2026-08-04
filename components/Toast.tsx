'use client';

import React, { useEffect } from 'react';
import { toast } from '@/lib/toast';

interface ToastProps {
  notification: { message: string; type: 'success' | 'error' } | null;
}

export default function Toast({ notification }: ToastProps) {
  useEffect(() => {
    if (notification) {
      if (notification.type === 'error') {
        toast.error(notification.message);
      } else {
        toast.success(notification.message);
      }
    }
  }, [notification]);

  return null;
}
