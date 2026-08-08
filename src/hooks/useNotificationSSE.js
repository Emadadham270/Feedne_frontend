import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

export function useNotificationSSE() {
  const { isAuthenticated, token } = useAuthStore();
  const { addNotification, fetchNotifications } = useNotificationStore();
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    // Initial fetch of notifications & unread count
    fetchNotifications();

    // Open EventSource connection passing token as query param
    const streamUrl = `/api/notifications/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(streamUrl);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.type !== 'CONNECTED') {
          addNotification(data);
        }
      } catch (err) {
        console.error('[SSE] Failed to parse notification:', err);
      }
    };

    es.onerror = (err) => {
      console.warn('[SSE] EventSource connection issue:', err);
      // Browser EventSource automatically attempts to reconnect on network drop
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [isAuthenticated, token, addNotification, fetchNotifications]);
}
