import React, { useContext, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { StateProvider, store } from './renderer/utils/store';
import { getTheme } from './renderer/utils/LocStoreUtil';
import { createTheme, CssBaseline, responsiveFontSizes, ThemeProvider } from '@mui/material';
// import '@fontsource/open-sans/300.css';
// import '@fontsource/open-sans/400.css';
// import '@fontsource/open-sans/500.css';
// import '@fontsource/open-sans/600.css';
import MiniPlayerView from './renderer/views/MiniPlayer/MiniPlayerView';
import { getBaseTheme } from './config/theme';
import { IpcProvider } from './renderer/state/ipc';
import './renderer/styles/mini_player.scss';

const root = ReactDOM.createRoot(document.getElementById('app'));

const App = ({ miniPlayer }) => {
  let isDarkThemePreferred = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (isDarkThemePreferred) {
    // Dark theme is preferred by the user/system
    console.log('Dark theme preferred');
  } else {
    // Light theme is preferred by the user/system
    console.log('Light theme preferred');
  }

  const { state, dispatch } = useContext(store);
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

function render() {
  root.render(
    <React.StrictMode>
      <StateProvider>
        <IpcProvider>
          <App />
        </IpcProvider>
      </StateProvider>
    </React.StrictMode>
  );
}

render();
