import { createContext, ReactNode, useContext, useState } from "react";

type IgnoredEventsContextState = {
  ignoredEvents: string[]
  addIgnoreId(id: string): void
}

export const IgnoredEventsContext = createContext<IgnoredEventsContextState>({
  ignoredEvents: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addIgnoreId() { }
})

type IgnoredEventsProviderProps = {
  children: ReactNode
}

export function IgnoredEventsProvider({ children }: IgnoredEventsProviderProps) {
  const [ignoredEvents, setIgnoredEvents] = useState<string[]>([])
  const addIgnoreId = (id: string) => setIgnoredEvents(data => ([...data, id]))
  return <IgnoredEventsContext.Provider value={{ ignoredEvents, addIgnoreId }}>
    {children}
  </IgnoredEventsContext.Provider>
}

export const useIgnoredEvents = () => useContext(IgnoredEventsContext)
