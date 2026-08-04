export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  id?: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number; // default 3500ms
}

export interface ConfirmOptions {
  id?: string;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface ActiveToast {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  duration: number;
  createdAt: number;
}

export interface ActiveConfirm {
  id: string;
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

type ToastListener = (toast: ToastOptions) => void;
type ConfirmListener = (options: ConfirmOptions, resolve: (value: boolean) => void) => void;
type DismissListener = (id?: string) => void;

class ToastManager {
  private toastListeners: ToastListener[] = [];
  private confirmListeners: ConfirmListener[] = [];
  private dismissListeners: DismissListener[] = [];

  onToast(listener: ToastListener) {
    this.toastListeners.push(listener);
    return () => {
      this.toastListeners = this.toastListeners.filter((l) => l !== listener);
    };
  }

  onConfirm(listener: ConfirmListener) {
    this.confirmListeners.push(listener);
    return () => {
      this.confirmListeners = this.confirmListeners.filter((l) => l !== listener);
    };
  }

  onDismiss(listener: DismissListener) {
    this.dismissListeners.push(listener);
    return () => {
      this.dismissListeners = this.dismissListeners.filter((l) => l !== listener);
    };
  }

  show(options: ToastOptions | string, type: ToastType = 'info') {
    const opts: ToastOptions =
      typeof options === 'string' ? { message: options, type } : { type, ...options };
    this.toastListeners.forEach((listener) => listener(opts));
  }

  success(message: string, title?: string, duration?: number) {
    this.show({ message, title, type: 'success', duration });
  }

  error(message: string, title?: string, duration?: number) {
    this.show({ message, title, type: 'error', duration });
  }

  warning(message: string, title?: string, duration?: number) {
    this.show({ message, title, type: 'warning', duration });
  }

  info(message: string, title?: string, duration?: number) {
    this.show({ message, title, type: 'info', duration });
  }

  dismiss(id?: string) {
    this.dismissListeners.forEach((listener) => listener(id));
  }

  confirm(options: ConfirmOptions | string): Promise<boolean> {
    return new Promise((resolve) => {
      const opts: ConfirmOptions =
        typeof options === 'string'
          ? { message: options, title: 'Konfirmasi Tindakan', variant: 'warning' }
          : { title: 'Konfirmasi Tindakan', variant: 'warning', ...options };

      if (this.confirmListeners.length === 0) {
        const res = typeof window !== 'undefined' ? window.confirm(opts.message) : true;
        if (res) opts.onConfirm?.();
        else opts.onCancel?.();
        resolve(res);
        return;
      }

      this.confirmListeners.forEach((listener) => listener(opts, resolve));
    });
  }
}

export const toast = new ToastManager();
export const notify = toast;
