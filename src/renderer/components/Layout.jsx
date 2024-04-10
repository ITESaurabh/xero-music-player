import React, { useEffect, useState } from 'react';
import Titlebar from './Titlebar';
import { styled } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  ListSubheader,
  Divider,
  useMediaQuery,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { Link, Outlet, useMatch, useResolvedPath } from 'react-router-dom';
import musicNoteIcon from '@iconify/icons-fluent/music-note-2-24-regular';
import musicNoteActiveIcon from '@iconify/icons-fluent/music-note-2-24-filled';
import FavIcon from '@iconify/icons-fluent/heart-24-regular';
import FavActiveIcon from '@iconify/icons-fluent/heart-24-filled';
import playlistIcon from '@iconify/icons-fluent/navigation-play-20-regular';
import playlistActiveIcon from '@iconify/icons-fluent/navigation-play-20-filled';
import albumIcon from '@iconify/icons-fluent/cd-16-regular';
import albumActiveIcon from '@iconify/icons-fluent/cd-16-filled';
import artistIcon from '@iconify/icons-fluent/mic-24-regular';
import artistActiveIcon from '@iconify/icons-fluent/mic-24-filled';
import albumArtistIcon from '@iconify/icons-fluent/book-open-microphone-24-regular';
import albumArtistActiveIcon from '@iconify/icons-fluent/book-open-microphone-24-filled';
import foldersIcon from '@iconify/icons-fluent/folder-24-regular';
import foldersActiveIcon from '@iconify/icons-fluent/folder-24-filled';
import foldersHierarchyIcon from '@iconify/icons-fluent/document-folder-24-regular';
import foldersHierarchyActiveIcon from '@iconify/icons-fluent/document-folder-24-filled';
import genresIcon from '@iconify/icons-fluent/guitar-24-regular';
import genresActiveIcon from '@iconify/icons-fluent/guitar-24-filled';
import yearsIcon from '@iconify/icons-fluent/timer-24-regular';
import yearsActiveIcon from '@iconify/icons-fluent/timer-24-filled';
import settingsIcon from '@iconify/icons-fluent/settings-24-regular';
import settingsActiveIcon from '@iconify/icons-fluent/settings-24-filled';

import PlayBar from './PlayBar';
import SearchBar from './SearchBar';
import { Icon } from '@iconify/react';

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

const menuItems = [
  {
    title: 'All Songs',
    href: '/main_window',
    icon: musicNoteIcon,
    iconActive: musicNoteActiveIcon,
  },
  {
    title: 'Favourites',
    href: '/main_window/favourites',
    icon: FavIcon,
    iconActive: FavActiveIcon,
  },
  {
    title: 'Playlists',
    href: '/main_window/playlists',
    icon: playlistIcon,
    iconActive: playlistActiveIcon,
    divider: true,
  },
  {
    title: 'Albums',
    href: '/main_window/albums',
    icon: albumIcon,
    iconActive: albumActiveIcon,
  },
  {
    title: 'Artists',
    href: '/main_window/artists',
    icon: artistIcon,
    iconActive: artistActiveIcon,
  },
  {
    title: 'Album Artists',
    href: '/main_window/album-artists',
    icon: albumArtistIcon,
    iconActive: albumArtistActiveIcon,
    divider: true,
  },
  {
    title: 'Folders',
    href: '/main_window/folders',
    icon: foldersIcon,
    iconActive: foldersActiveIcon,
  },
  {
    title: 'Folder Hierarchy',
    href: '/main_window/folder-hierarchy',
    icon: foldersHierarchyIcon,
    iconActive: foldersHierarchyActiveIcon,
  },
  {
    title: 'Genres',
    href: '/main_window/genres',
    icon: genresIcon,
    iconActive: genresActiveIcon,
  },
  {
    title: 'Years',
    href: '/main_window/years',
    icon: yearsIcon,
    iconActive: yearsActiveIcon,
  },
];

function Layout() {
  const [open, setOpen] = useState(true);
  // const { state, dispatch } = useContext(store);
  const toggleDrawer = () => setOpen(!open);
  const isPhone = useMediaQuery(({ breakpoints }) => breakpoints.down('md'));

  useEffect(() => {
    if (isPhone) {
      setOpen(false);
    } else {
      setOpen(true);
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
          open={open}
        >
          <List
            sx={{
              width: '100%',
              maxWidth: 360,
              position: 'relative',
              overflow: 'auto',
              p: 1,
              '& ul': { padding: 0 },
              '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar for Chrome, Safari and Opera
              msOverflowStyle: 'none', // Hide scrollbar for IE and Edge
            }}
            subheader={<li />}
            // sx={{ p: 1 }}
          >
            <ListSubheader disableGutters sx={{ borderRadius: 100, backgroundColor: '#201e23' }}>
              {/* <Box sx={{ position: 'sticky' }}> */}
              <SearchBar open={open} toggleDrawer={toggleDrawer} />
              {/* </Box> */}
            </ListSubheader>
            {menuItems.map((item, index) => (
              <CustomLink key={index} item={item} />
            ))}
          </List>
          <List sx={{ mt: 'auto', p: 1 }}>
            <CustomLink
              item={{
                title: 'Settings',
                href: '/main_window/settings',
                icon: settingsIcon,
                iconActive: settingsActiveIcon,
              }}
            />
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

function CustomLink({ item, ...props }) {
  let resolved = useResolvedPath(item.href);
  let match = useMatch({ path: resolved.pathname, end: true });
  // console.log(match);
  return (
    <>
      <ListItemButton
        component={Link}
        sx={{ borderRadius: 15, mb: 1 }}
        selected={!!match}
        to={item.href}
        // dense
        {...props}
      >
        <ListItemIcon sx={{ mr: -1 }}>
          <Icon icon={match ? item.iconActive : item.icon} height={'1.5rem'} />
        </ListItemIcon>
        <ListItemText primary={item.title} />
      </ListItemButton>
      {item.divider && <Divider sx={{ mb: 1 }} />}
    </>
  );
}

export default Layout;
