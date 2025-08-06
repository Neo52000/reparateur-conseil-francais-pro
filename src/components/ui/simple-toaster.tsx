import * as React from 'react';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface ToasterContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToasterContext = React.createContext<ToasterContextType>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
});

export const SimpleToasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((newToast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toastWithId = { ...newToast, id };
    
    setToasts(prev => [...prev, toastWithId]);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToasterContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <SimpleToaster />
    </ToasterContext.Provider>
  );
};

export const useSimpleToast = () => {
  const context = React.useContext(ToasterContext);
  if (!context) {
    throw new Error('useSimpleToast must be used within a SimpleToasterProvider');
  }
  return context;
};

const SimpleToaster: React.FC = () => {
  const { toasts, dismiss } = useSimpleToast();

  return (
    <div className="fixed bottom-0 right-0 z-50 w-full md:max-w-[420px] md:bottom-4 md:right-4">
      <div className="space-y-2 p-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'relative pointer-events-auto flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all',
              toast.variant === 'destructive'
                ? 'border-destructive bg-destructive text-destructive-foreground'
                : 'border bg-background text-foreground'
            )}
          >
            <div className="grid gap-1">
              {toast.title && (
                <div className="text-sm font-semibold">{toast.title}</div>
              )}
              {toast.description && (
                <div className="text-sm opacity-90">{toast.description}</div>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100"
            >
              <span className="sr-only">Close</span>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};