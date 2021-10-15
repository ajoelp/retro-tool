import { ReactNode } from 'react'
import { extendTheme, ChakraProvider } from "@chakra-ui/react"

export type DefaultTheme = {
  typography: {
    primary: 'black',
  },
  backgrounds: {
    primary: 'white',
  },
}

export const chakraTheme = extendTheme({})

export function ThemeProvider({ children }: { children: ReactNode }) {
  console.log(chakraTheme)
  return (
    <ChakraProvider theme={chakraTheme}>
      {children}
    </ChakraProvider>
  )
}
