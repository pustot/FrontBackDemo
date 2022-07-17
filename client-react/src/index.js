import React from "react";
import ReactDOM from "react-dom";

import { ThemeProvider, useTheme, createTheme } from '@mui/material/styles';

import App from "./App";

const rootElement = document.getElementById("root");
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});
ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  rootElement
);
