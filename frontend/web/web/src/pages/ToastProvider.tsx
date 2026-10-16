import { useState, type ReactNode } from 'react';
import { ToastContext } from './ToastContext';
import styles from './Header.module.css';

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
      <div
        className={`${styles.toastNotification} ${show ? styles.show : ''} ${toastError ? styles.error : styles.success}`}
      >
        {toastMessage}
      </div>
    </ToastContext.Provider>
  );
};
