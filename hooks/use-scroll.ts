import { useEffect } from "react";


/**
 * Hook for locking the scroll of the body
 * 
 * @param {boolean} lock - Whether to lock the scroll
 */
export const useScroll = (lock: boolean) => {
  /**
   * Effect for locking the scroll of the body
   * 
   * @param {boolean} lock - Whether to lock the scroll
   */
  useEffect(() => {
    if (lock) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [lock]);
}