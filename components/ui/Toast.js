'use client';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const colors = {
    success: 'var(--green)',
    error:   'var(--red)',
    warn:    'var(--yellow)',
    info:    'var(--navy)',
    ai:      'var(--purple)',
  };

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            className="fade-up"
            style={{
              background: 'var(--navy-dark)',
              color: '#fff',
              borderLeft: `4px solid ${colors[t.type] || colors.success}`,
              padding: '11px 18px',
              fontSize: '0.82rem',
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(15,26,90,0.35)',
              maxWidth: 340,
              lineHeight: 1.5,
            }}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}