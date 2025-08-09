import { useEffect, useRef } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeOptions {
  threshold?: number; // Minimum distance for swipe detection (default: 50px)
  velocity?: number;  // Minimum velocity for swipe (default: 0.5)
}

export function useSwipeGesture(
  elementRef: React.RefObject<HTMLElement>,
  handlers: SwipeHandlers,
  options: SwipeOptions = {}
) {
  const { threshold = 50, velocity = 0.5 } = options;
  
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartX.current || !touchStartY.current) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();

      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;
      const deltaTime = touchEndTime - touchStartTime.current;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Calculate velocity
      const velocityX = absX / deltaTime;
      const velocityY = absY / deltaTime;

      // Determine if it's a horizontal or vertical swipe
      if (absX > absY && absX > threshold && velocityX > velocity) {
        // Horizontal swipe
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      } else if (absY > absX && absY > threshold && velocityY > velocity) {
        // Vertical swipe
        if (deltaY > 0) {
          handlers.onSwipeDown?.();
        } else {
          handlers.onSwipeUp?.();
        }
      }

      // Reset
      touchStartX.current = 0;
      touchStartY.current = 0;
      touchStartTime.current = 0;
    };

    // Add passive: false to allow preventDefault if needed
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, handlers, threshold, velocity]);
}

// Simplified hook for workout drill navigation
export function useWorkoutSwipe(
  onNext: () => void,
  onPrevious: () => void,
  enabled: boolean = true
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useSwipeGesture(
    containerRef,
    {
      onSwipeLeft: enabled ? onNext : undefined,
      onSwipeRight: enabled ? onPrevious : undefined,
    },
    {
      threshold: 50,
      velocity: 0.3, // Lower velocity for easier swiping during workout
    }
  );

  return containerRef;
}