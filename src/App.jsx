import React, { useContext, useEffect, useMemo, useState } from 'react';
import { store } from './renderer/utils/store';
import { getTheme } from './renderer/utils/LocStoreUtil';
import { useRoutes } from 'react-router-dom';
import { createTheme, CssBaseline, responsiveFontSizes, ThemeProvider } from '@mui/material';
import routes from './renderer/utils/routes';
// import '@fontsource/open-sans/300.css';
// import '@fontsource/open-sans/400.css';
// import '@fontsource/open-sans/500.css';
// import '@fontsource/open-sans/600.css';
import { getBaseTheme } from './config/theme';
import { ipcRenderer } from 'electron';
import Titlebar from './renderer/components/Titlebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useKeyboardShortcuts, SHORTCUTS } from './renderer/utils/useKeyboardShortcuts';

const queryClient = new QueryClient();

const App = () => {
  const { state, dispatch } = useContext(store);
  const [systemIsDark, setSystemIsDark] = useState(true);
  const currTheme = getTheme();

  // console.log('Re Render Core');
  const themePref = useMemo(() => (systemIsDark ? 'dark' : 'light'), [systemIsDark]);
  const finalRoutes = useMemo(() => routes, []);

  const element = useRoutes(finalRoutes);

  const theme = useMemo(() => {
    const darkModeTheme = createTheme(getBaseTheme(themePref));
    return responsiveFontSizes(darkModeTheme);
  }, [themePref]);

  useEffect(() => {
    ipcRenderer.invoke('get-dark-mode').then(darkMode => {
      setSystemIsDark(darkMode);
    });
  }, []);

  useEffect(() => {
    if (currTheme === undefined) {
      dispatch({ type: 'SET_THEME', payload: false });
    } else {
      dispatch({ type: 'SET_THEME', payload: currTheme });
    }
  }, [currTheme, dispatch]);

  // Register keyboard shortcuts
  useKeyboardShortcuts(
    [
      {
        ...SHORTCUTS.SEARCH,
        action: () => dispatch({ type: 'SET_SEARCH_ENABLED', payload: !state.searchEnabled }),
      },
    ],
    { dispatch }
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Titlebar />
        {element}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
