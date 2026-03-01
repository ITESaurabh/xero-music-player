import { PaletteMode } from '@mui/material';

export const getBaseTheme = (mode: PaletteMode) => ({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#ffaaf4' : '#9b2e99',
    },
    secondary: {
      main: '#B76C6C',
    },
    error: {
      main: '#c42b1c',
    },
    background: {
      ...(mode === 'dark'
        ? {
            default: '#201e23',
            paper: '#27262a',
          }
        : {
            default: '#f4f1f9',
            paper: '#f9f8fc',
          }),
    },
    text: {
      ...(mode === 'dark'
        ? {
            primary: '#ffffff',
          }
        : {
            primary: '#000000',
          }),
    },
  },
  typography: {
    h1: {
      fontSize: '3.052rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2.441rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.953rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.563rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      letterSpacing: '0.025rem',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  props: {
    MuiAppBar: {
      color: 'default',
    },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          height: '100%',
        },
        body: {
          height: '100%',
        },
        '#app': {
          height: '100%',
        },
      },
    },
  },
});
