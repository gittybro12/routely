import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { ThemeModeProvider, useThemeMode } from './ThemeContext';
import './styles.css';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0ea5e9' },
    secondary: { main: '#14b8a6' },
    background: {
      default: '#f4f7fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#1d2733',
      secondary: '#475569',
    },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#22d3ee' },
    secondary: { main: '#14b8a6' },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
});

function ThemedApp() {
  const { mode } = useThemeMode();
  return (
    <ThemeProvider theme={mode === 'dark' ? darkTheme : lightTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeModeProvider>
      <ThemedApp />
    </ThemeModeProvider>
  </React.StrictMode>,
);
