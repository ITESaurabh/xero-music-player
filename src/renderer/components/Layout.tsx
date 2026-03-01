import React, { useContext, useEffect } from 'react';
import Titlebar from './Titlebar';
import { styled, Theme } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import { Paper, Stack, useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { Outlet } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';

import PlayBar from './PlayBar';
import MainDrawer from './MainDrawer';
import { store } from '../utils/store';
import SearchDialog from './SearchDialog';

const drawerWidth = 320;

const Drawer = styled(MuiDrawer, { shouldForwardProp: prop => prop !== 'open' })(
  ({ theme, open }: { theme: Theme; open?: boolean }) => ({
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
  const isPhone = useMediaQuery(({ breakpoints }: Theme) => breakpoints.down('md'));
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
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
          }}
          PaperProps={{
            style: {
              paddingTop: '32px',
              backgroundColor: 'transparent',
              borderRight: 'none',
            },
          }}
          open={state.isMenuExpanded}
        >
          <MainDrawer />
        </Drawer>
        <Stack
          sx={{
            height: '100%',
            width: '100%',
            flex: 1,
            position: 'relative',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          <Box height="32px">&nbsp;</Box>
          <Grid
            component={Paper}
            borderRadius={'0.5rem 0rem 0rem 0.5rem'}
            sx={{
              height: '100%',
              flex: 1,
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
              p: 0,
              m: 0,
            }}
            container
          >
            <AnimatePresence>
              <Grid
                xs={12}
                sx={{
                  height: '100%',
                  maxHeight: 'calc(100vh - 32px)',
                  borderTopLeftRadius: '0.5rem',
                  flex: 1,
                  width: '100%',
                  maxWidth: '100%',
                  minWidth: 0,
                  p: 0,
                  m: 0,
                }}
              >
                <Outlet />
              </Grid>
            </AnimatePresence>
          </Grid>
          <motion.div
            animate={{
              y: isPhone
                ? state.isPlayerBarVisible
                  ? -220
                  : 200
                : state.isPlayerBarVisible
                  ? -220
                  : 0,
            }}
            transition={{ type: isPhone ? 'tween' : 'spring' }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: isPhone ? -220 : -200,
              zIndex: 10,
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'auto',
            }}
          >
            <Box
              sx={{
                width: '100%',
                margin: 'auto',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <PlayBar />
            </Box>
          </motion.div>
        </Stack>
      </Box>
      <SearchDialog />
    </Box>
  );
}

export default Layout;
