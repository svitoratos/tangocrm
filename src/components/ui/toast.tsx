"use client";

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Toast } from '@/hooks/use-toast';

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export const ToastComponent: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'destructive':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 w-96 max-w-sm rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out',
        getVariantStyles(toast.variant || 'default')
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium">{toast.title}</h4>
          {toast.description && (
            <p className="mt-1 text-sm opacity-90">{toast.description}</p>
          )}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="ml-4 flex-shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

interface ToasterProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const Toaster: React.FC<ToasterProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}; 