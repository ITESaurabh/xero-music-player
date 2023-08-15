import React, { useContext, useEffect } from 'react';
import { store } from './renderer/utils/store';
import { getTheme } from './renderer/utils/LocStoreUtil';
import { useRoutes } from 'react-router-dom';
import { createTheme, CssBaseline, responsiveFontSizes, ThemeProvider } from '@mui/material';
import routes from './renderer/utils/routes';
import '@fontsource/open-sans/300.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/500.css';
import '@fontsource/open-sans/600.css';
import { getBaseTheme } from './config/theme';

const App = () => {
  const { _state, dispatch } = useContext(store);
  const currTheme = getTheme();
  let themePref = currTheme ? 'light' : 'dark';
  let element = useRoutes(routes);
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
      {element}
    </ThemeProvider>
  );
};

export default App;
