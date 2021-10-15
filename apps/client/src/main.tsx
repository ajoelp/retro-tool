import { ColorModeScript } from "@chakra-ui/react"
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';

import App from './app/app';
import { chakraTheme } from './app/contexts/ThemeProvider';

ReactDOM.render(
  <StrictMode>
    <ColorModeScript initialColorMode={chakraTheme.config.initialColorMode} />
    <App />
  </StrictMode>,
  document.getElementById('root'),
);
