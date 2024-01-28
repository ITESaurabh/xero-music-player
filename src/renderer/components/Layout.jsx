import React, { useContext, useEffect, useState } from 'react';
import Titlebar from './Titlebar';
import { styled } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import IconButton from '@mui/material/IconButton';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Switch,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { Link, Outlet, useMatch, useResolvedPath } from 'react-router-dom';
import { store } from '../utils/store';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import AdbOutlinedIcon from '@mui/icons-material/AdbOutlined';
import LibraryMusicOutlinedIcon from '@mui/icons-material/LibraryMusicOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PlayBar from './PlayBar';

const drawerWidth = 360;

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
  const [open, setOpen] = useState(true);
  const { state, dispatch } = useContext(store);
  const toggleDrawer = () => setOpen(!open);
  const theme = useTheme();
  const isPhone = useMediaQuery(({ breakpoints }) => breakpoints.down('md'));
  const isPortable = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (isPortable) {
      setOpen(false);
    }
  }, [isPortable]);

  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box height={'100%'}>
      <Titlebar />
      <Box display={'flex'} height={'100%'}>
        <Drawer
          variant={isPhone ? 'temporary' : 'permanent'}
          sx={{ height: '100%', overflow: 'hidden' }}
          PaperProps={{
            style: {
              paddingTop: '32px',
              backgroundColor: 'transparent',
              borderRight: 'none',
            },
          }}
          open={open}
        >
          <Toolbar sx={{ pl: '28px !important' }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
            >
              <MenuOutlinedIcon />
            </IconButton>
          </Toolbar>
          <List sx={{ p: 1 }}>
            <CustomLink to="/main_window">
              <ListItemIcon>
                <LibraryMusicOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Library" />
            </CustomLink>
            <CustomLink to="/main_window/search">
              <ListItemIcon>
                <SearchOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Search" />
            </CustomLink>
            <CustomLink to="/main_window/eq">
              <ListItemIcon>
                <AdbOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Equalizer" />
            </CustomLink>
          </List>
          <List sx={{ mt: 'auto', p: 1 }}>
            <ListItemButton
              sx={{ borderRadius: 15, mb: 1 }}
              onClick={() => dispatch({ type: 'SET_THEME', payload: !state.isLightTheme })}
            >
              <ListItemIcon>
                <AdbOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Dark Mode" />
              <Switch
                edge="end"
                checked={!state.isLightTheme}
                onChange={() => dispatch({ type: 'SET_THEME', payload: !state.isLightTheme })}
                inputProps={{
                  'aria-labelledby': 'theme-toggle',
                }}
              />
            </ListItemButton>
            <CustomLink to="/brunch-pwa/settings">
              <ListItemIcon>
                <SettingsOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </CustomLink>
          </List>
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

function CustomLink({ children, to, ...props }) {
  let resolved = useResolvedPath(to);
  let match = useMatch({ path: resolved.pathname, end: true });

  return (
    <ListItemButton
      component={Link}
      sx={{ borderRadius: 15, mb: 1 }}
      selected={!!match}
      to={to}
      {...props}
    >
      {children}
    </ListItemButton>
  );
}

export default Layout;
