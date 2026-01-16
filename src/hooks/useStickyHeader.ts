import { useState, useEffect, RefObject } from 'react';

export function useStickyHeader(
  heroRef: RefObject<HTMLElement | null>,
  _unusedScrollRef?: any, 
  thresholdRatio: number = 0.1 // Меняем логику: когда осталось 10% героя, считаем что он ушел
) {
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const element = heroRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Если Hero больше не пересекается с вьюпортом (или почти ушел наверх), показываем стики бар
        setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      {
        threshold: [0, thresholdRatio], // Триггеримся когда элемент полностью уходит или только появляется
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [heroRef, thresholdRatio]);

  return showStickyBar;
}