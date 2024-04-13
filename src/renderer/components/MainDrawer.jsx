import React, { useContext } from 'react';
import List from '@mui/material/List';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Divider,
  useTheme,
} from '@mui/material';
import SearchBar from './SearchBar';
import { Link, useMatch, useResolvedPath } from 'react-router-dom';
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
import { Icon } from '@iconify/react';
import { store } from '../utils/store';

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

function MainDrawer({ tempDrawer }) {
  const { state, dispatch } = useContext(store);
  const theme = useTheme();
  const toggleDrawer = () => {
    dispatch({ type: 'SET_MENU_EXPANDED', payload: !state.isMenuExpanded });
  };

  return (
    <>
      <List
        sx={{
          width: '100%',
          //   maxWidth: 600,
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
        <ListSubheader
          disableGutters
          sx={{
            borderRadius: 100,
            backgroundColor:
              theme.palette.mode === 'dark' ? '#201e23' : theme.palette.background.paper,
          }}
        >
          <SearchBar
            open={state.isMenuExpanded}
            tempDrawer={tempDrawer}
            toggleDrawer={toggleDrawer}
          />
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
    </>
  );
}

function CustomLink({ item, ...props }) {
  let resolved = useResolvedPath(item.href);
  let match = useMatch({ path: resolved.pathname, end: true });
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

export default MainDrawer;
