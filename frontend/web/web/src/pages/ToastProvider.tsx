// ToastProvider.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import styles from './Header.module.css';

interface ToastContextType {
  showToast: (message: string, isError?: boolean) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError] = useState(false);
  const [show, setShow] = useState(false);

  const showToast = (message: string, isError = false) => {
    setToastMessage(message);
    setToastError(isError);
    setShow(true);
    setTimeout(() => setShow(false), 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={`${styles.toastNotification} ${show ? styles.show : ''} ${toastError ? styles.error : styles.success}`}>
        {toastMessage}
      </div>
    </ToastContext.Provider>
  );
};
