import { useCallback, useEffect, useRef } from 'react';

type CallbackType = () => (() => void) | void;

export function useRequestAnimationInterval(
  callback: CallbackType,
  interval = 1000,
) {
  const ref = useRef<number>(performance.now());
  const step = useCallback(
    (timestamp: number) => {
      if (timestamp - ref.current > interval) {
        ref.current = timestamp;
        callback();
      }
      window.requestAnimationFrame(step);
    },
    [callback, interval],
  );

  useEffect(() => {
    const req = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(req);
    };
  }, [step]);
}
