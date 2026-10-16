import { createContext, useContext } from 'react';

export interface ToastContextType {
  showToast: (message: string, isError?: boolean) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};