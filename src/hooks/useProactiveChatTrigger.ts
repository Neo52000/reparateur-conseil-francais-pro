import { useCallback, useEffect, useRef, useState } from 'react';

export function useProactiveChatTrigger(enabled: boolean = true) {
  const [triggered, setTriggered] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!enabled) return;

    const updateActivity = () => { lastActivityRef.current = Date.now(); };
    const onScroll = () => {
      const scrolled = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (!triggered && scrolled >= 0.5) {
        setTriggered(true);
        window.dispatchEvent(new CustomEvent('open-chatbot'));
      }
    };

    const interval = setInterval(() => {
      if (triggered) return;
      const idleMs = Date.now() - lastActivityRef.current;
      if (idleMs >= 15000) {
        setTriggered(true);
        window.dispatchEvent(new CustomEvent('open-chatbot'));
      }
    }, 1000);

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('scroll', onScroll);
    };
  }, [enabled, triggered]);
}
