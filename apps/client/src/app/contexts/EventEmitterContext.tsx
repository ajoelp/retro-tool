import EventEmitter from 'eventemitter3';
import { createContext, ReactNode, useContext, useMemo } from 'react';

const context = createContext<EventEmitter>(new EventEmitter());

export const EventEmitterProvider = ({ children }: { children: ReactNode }) => {
  const emitter = useMemo(() => {
    return new EventEmitter();
  }, []);
  return <context.Provider value={emitter}>{children}</context.Provider>;
};

export const useEmitter = () => {
  return useContext(context);
};

export const eventEmitter = new EventEmitter();
