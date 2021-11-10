import { ReactNode } from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

export type DefaultTheme = {
  typography: {
    primary: 'black';
  };
  backgrounds: {
    primary: 'white';
  };
};

export const chakraTheme = extendTheme({});

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ChakraProvider theme={chakraTheme}>{children}</ChakraProvider>;
}
