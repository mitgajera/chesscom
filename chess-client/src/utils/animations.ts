import { useRef, useEffect } from 'react';

export const useEntranceAnimation = (delay: number, duration: number) => {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      const element = ref.current;
      element.style.transition = `opacity ${duration}ms ease-in-out ${delay}ms`;
      element.style.opacity = '1';

    }
  }, [delay, duration]);

  return { ref };
};