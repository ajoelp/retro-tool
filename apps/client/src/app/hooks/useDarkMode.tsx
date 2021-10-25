import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const LIGHT = 'light' as const;
const DARK = 'dark' as const;

type LightOrDark = typeof LIGHT | typeof DARK;

type DarkModeState = {
  theme: LightOrDark;
  setTheme(theme: LightOrDark): void;
  toggleTheme(): void;
};

const context = createContext<DarkModeState>({} as DarkModeState);

export function useColorPreferences() {
  return useContext(context);
}

export function ColorPreferencesWrapper({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const checkDarkMode = useCallback(() => {
    if (
      localStorage.theme === DARK ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      return DARK;
    }
    return LIGHT;
  }, []);

  const [theme, setTheme] = useState<LightOrDark>(LIGHT);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === DARK ? LIGHT : DARK));
  }, []);

  useEffect(() => {
    setTheme(checkDarkMode());
  }, [checkDarkMode]);

  useEffect(() => {
    if (theme === DARK) {
      window.document.body.classList.remove(LIGHT);
      window.document.body.classList.add(DARK);
    } else {
      window.document.body.classList.remove(DARK);
      window.document.body.classList.add(LIGHT);
    }
  }, [theme]);
  return (
    <context.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </context.Provider>
  );
}
