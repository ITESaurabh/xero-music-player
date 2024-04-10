import React, { useContext, useEffect } from 'react';
import Titlebar from './Titlebar';
import { styled } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import { Paper, Stack, useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { Outlet } from 'react-router-dom';

import PlayBar from './PlayBar';
import MainDrawer from './MainDrawer';
import { store } from '../utils/store';
const drawerWidth = 320;
const Drawer = styled(MuiDrawer, { shouldForwardProp: prop => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  })
);

function Layout() {
  const isPhone = useMediaQuery(({ breakpoints }) => breakpoints.down('md'));
  const { state, dispatch } = useContext(store);
  useEffect(() => {
    if (isPhone) {
      dispatch({ type: 'SET_MENU_EXPANDED', payload: false });
    } else {
      dispatch({ type: 'SET_MENU_EXPANDED', payload: true });
    }
  }, [isPhone]);
  return (
    <Box height={'100%'}>
      <Titlebar />
      <Box display={'flex'} height={'100%'}>
        <Drawer
          variant={isPhone ? 'temporary' : 'permanent'}
          sx={{
            height: '100%',
            overflow: 'hidden',
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
          }}
          PaperProps={{
            style: {
              paddingTop: '32px',
              backgroundColor: 'transparent',
              overflow: 'hidden',
              borderRight: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              msOverflowStyle: 'none',
            },
          }}
          open={state.isMenuExpanded}
        >
          <MainDrawer />
        </Drawer>
        <Stack height={'100%'} width={'100%'}>
          <Box height="32px">&npsb;</Box>
          <Grid
            component={Paper}
            borderRadius={'0.5rem 0rem 0rem 0.5rem'}
            height={'100%'}
            container
          >
            <Grid
              xs={12}
              sx={{
                height: '100%',
                maxHeight: 'calc(100vh - 32px)',
                overflowY: 'auto',
                borderTopLeftRadius: '0.5rem',
              }}
            >
              <Outlet />
            </Grid>
            <Box sx={{ mt: '-11.5rem', zIndex: 1, width: '100%' }}>
              <PlayBar />
            </Box>
          </Grid>
        </Stack>
      </Box>
    </Box>
  );
}

export default Layout;
