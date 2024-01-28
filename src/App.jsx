import React, { useContext, useEffect, useState } from 'react';
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

const App = () => {
  const { _state, dispatch } = useContext(store);
  const [systemIsDark, setSystemIsDark] = useState(false);
  const currTheme = getTheme();
  console.log(currTheme);
  let themeMode = currTheme === null ? systemIsDark : !currTheme;
  let themePref = systemIsDark ? 'dark' : 'light';
  let element = useRoutes(routes);
  const darkModeTheme = createTheme(getBaseTheme(themePref));
  const theme = responsiveFontSizes(darkModeTheme);
  useEffect(() => {
    ipcRenderer.invoke('get-dark-mode').then(darkMode => {
      setSystemIsDark(darkMode);
    });
  }, []);

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
      {element}
    </ThemeProvider>
  );
};

export default App;
