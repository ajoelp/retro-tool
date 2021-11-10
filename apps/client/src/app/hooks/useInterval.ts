import { useEffect } from 'react';

type CallbackType = () => (() => void) | void;

export function useInterval(callback: CallbackType, interval = 1000) {
  useEffect(() => {
    const req = window.setInterval(() => {
      callback();
    }, interval);
    return () => {
      window.clearInterval(req);
    };
  }, [callback, interval]);
}
