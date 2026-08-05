import { useRef, useEffect } from 'react';

/**
 * Fires `callback` when the observed element enters the viewport.
 * Used for infinite scroll — attach ref to the last list item.
 */
export function useIntersectionObserver(callback, options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) callback();
    }, { threshold: 0.1, ...options });

    observer.observe(el);
    return () => observer.disconnect();
  }, [callback, options]);

  return ref;
}
