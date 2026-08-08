import { useState, useEffect } from 'react';
import { NoInternetPage } from '@/pages/error/NoInternetPage';

export function OfflineDetector({ children }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (isOffline) {
    return <NoInternetPage onRetry={() => setIsOffline(!navigator.onLine)} />;
  }

  return children;
}
