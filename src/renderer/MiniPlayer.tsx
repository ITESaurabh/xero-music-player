import React, { useContext, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { StateProvider, store } from './utils/store';
import { getTheme } from './utils/LocStoreUtil';
import { createTheme, CssBaseline, responsiveFontSizes, ThemeProvider } from '@mui/material';
// import '@fontsource/open-sans/300.css';
// import '@fontsource/open-sans/400.css';
// import '@fontsource/open-sans/500.css';
// import '@fontsource/open-sans/600.css';
import MiniPlayerView from './views/MiniPlayer/MiniPlayerView';
import { getBaseTheme } from '../config/theme';
import { IpcProvider } from './state/ipc';
import './styles/mini_player.scss';

const root = createRoot(document.getElementById('app')!);

const App = () => {
  let isDarkThemePreferred = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const { dispatch } = useContext(store);
  const currTheme = getTheme();
  let themePref = !isDarkThemePreferred ? 'light' : 'dark';
  const darkModeTheme = createTheme(getBaseTheme(themePref));
  const theme = responsiveFontSizes(darkModeTheme);

  useEffect(() => {
    if (currTheme === undefined) {
      dispatch({ type: 'SET_THEME', payload: true });
    } else {
      dispatch({ type: 'SET_THEME', payload: currTheme });
    }
  }, [currTheme, dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MiniPlayerView />
    </ThemeProvider>
  );
};

root.render(
  <React.StrictMode>
    <StateProvider>
      <IpcProvider>
        <App />
      </IpcProvider>
    </StateProvider>
  </React.StrictMode>
);
