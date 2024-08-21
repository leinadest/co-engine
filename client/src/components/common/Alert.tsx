import React, { useEffect, SetStateAction, Dispatch } from 'react';

export interface AlertState {
  visible: boolean;
  type?: 'success' | 'error';
  message?: string;
  onClose?: () => void;
  duration?: number;
}

interface AlertProps extends AlertState {
  setAlert: Dispatch<SetStateAction<AlertState>>;
}

export default function Alert({
  visible,
  type,
  message,
  onClose,
  duration = 5000,
  setAlert,
}: AlertProps) {
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      setAlert((prev) => ({ ...prev, visible: false }));
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, onClose, setAlert]);

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded shadow-lg text-white transition-opacity ${
        type === 'success' ? 'bg-success' : 'bg-error'
      } ${visible ? '' : 'opacity-0'}`}
      role="alert"
    >
      <span>{message}</span>
      <button
        onClick={() => {
          setAlert((prev) => ({ ...prev, visible: false }));
          if (onClose) onClose();
        }}
        className="ml-4 text-lg font-bold"
      >
        &times;
      </button>
    </div>
  );
}
