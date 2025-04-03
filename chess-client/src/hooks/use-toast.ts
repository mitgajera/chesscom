import { useState, useEffect } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  duration?: number;
  [key: string]: any;
}

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
  action?: React.ReactNode;
  [key: string]: any;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Toast) => {
    setToasts((prevToasts) => [...prevToasts, toast]);
  };

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Updated toast function to accept an object
  const toast = (options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    addToast({ id, ...options });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (toasts.length > 0) {
        removeToast(toasts[0].id);
      }
    }, toasts[0]?.duration || 5000);

    return () => clearTimeout(timer);
  }, [toasts]);

  return { toasts, addToast, removeToast, toast };
}

// Standalone toast function
export function useToastStandalone(options: ToastOptions) {
  const { toast } = useToast();
  toast(options);
}
