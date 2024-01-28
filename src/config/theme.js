export const getBaseTheme = mode => ({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#ffaaf4' : '#9b2e99',
    },
    secondary: {
      main: '#B76C6C',
    },
    error: {
      main: '#C42B1C',
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
    // fontFamily: ['Open Sans', 'sans-serif', '"Apple Color Emoji"'].join(','),
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
    // Disable h3 variant
  },
  props: {
    MuiAppBar: {
      color: 'default',
    },
  },
  shape: {
    borderRadius: 10,
  },
  //
  // Overrides
  // cssbaseline:
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          // paddingBottom: "8rem",
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
