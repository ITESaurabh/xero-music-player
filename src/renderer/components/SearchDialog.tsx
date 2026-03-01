import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  ButtonBase,
  Dialog,
  DialogContent,
  Grow,
  InputAdornment,
  Stack,
  TextField,
  useMediaQuery,
  Typography,
  Paper,
  Grid,
  Collapse,
  CircularProgress,
} from '@mui/material';
import { Icon, IconifyIcon } from '@iconify/react';
import searchIcon from '@iconify/icons-fluent/search-24-filled';
import musicNoteIcon from '@iconify/icons-fluent/music-note-2-24-regular';
import playlistIcon from '@iconify/icons-fluent/navigation-play-20-regular';
import albumIcon from '@iconify/icons-fluent/cd-16-regular';
import artistIcon from '@iconify/icons-fluent/mic-24-regular';
import albumArtistIcon from '@iconify/icons-fluent/book-open-microphone-24-regular';
import foldersIcon from '@iconify/icons-fluent/folder-24-regular';
import genresIcon from '@iconify/icons-fluent/guitar-24-regular';
import yearsIcon from '@iconify/icons-fluent/timer-24-regular';
import { store, Track } from '../utils/store';
import { useNavigate } from 'react-router';
import { useIpc } from '../state/ipc';
import { Theme } from '@mui/material/styles';

interface SearchCategory {
  title: string;
  type: string;
  icon: IconifyIcon | string;
  href: string;
}

interface SearchResults {
  songs: Track[];
  albums: Track[];
  artists: Track[];
  albumArtists: Track[];
  genres: Track[];
  years: Track[];
  folders: Track[];
  playlists: Track[];
  [key: string]: Track[];
}

const searchCategories: SearchCategory[] = [
  {
    title: 'Songs',
    type: 'songs',
    icon: musicNoteIcon,
    href: '/main_window',
  },
  {
    title: 'Albums',
    type: 'albums',
    icon: albumIcon,
    href: '/main_window/albums',
  },
  {
    title: 'Artists',
    type: 'artists',
    icon: artistIcon,
    href: '/main_window/artists',
  },
  {
    title: 'Album Artists',
    type: 'albumArtists',
    icon: albumArtistIcon,
    href: '/main_window/album-artists',
  },
  {
    title: 'Playlists',
    type: 'playlists',
    icon: playlistIcon,
    href: '/main_window/playlists',
  },
  {
    title: 'Genres',
    type: 'genres',
    icon: genresIcon,
    href: '/main_window/genres',
  },
  {
    title: 'Years',
    type: 'years',
    icon: yearsIcon,
    href: '/main_window/years',
  },
  {
    title: 'Folders',
    type: 'folders',
    icon: foldersIcon,
    href: '/main_window/folders',
  },
];

export default function SearchDialog() {
  const ref = React.useRef<HTMLInputElement>(null);
  const { state, dispatch } = useContext(store);
  const isPhone = useMediaQuery(({ breakpoints }: Theme) => breakpoints.down('md'));
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { invokeEventToMainProcess } = useIpc();

  const handleEntered = () => {
    if (ref.current) {
      ref.current.focus();
    }
  };

  const handleClose = () => {
    dispatch({ type: 'SET_SEARCH_ENABLED', payload: false });
    setSearchQuery('');
    setSearchResults(null);
  };

  const handleResultClick = (category: SearchCategory, result: Track) => {
    if (category.type === 'songs') {
      dispatch({
        type: 'SET_QUEUE',
        payload: { queue: [result], index: 0 },
      });
      dispatch({ type: 'SET_CURR_TRACK', payload: result });
      dispatch({ type: 'SET_IS_PLAYING', payload: true });
    } else {
      navigate(category.href);
    }
    handleClose();
  };

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await invokeEventToMainProcess('search-library', { query: searchQuery });
        setSearchResults(results as SearchResults);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults({
          songs: [],
          albums: [],
          artists: [],
          albumArtists: [],
          genres: [],
          years: [],
          folders: [],
          playlists: [],
        });
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, invokeEventToMainProcess]);

  const getSearchResults = (category: string): Track[] => {
    if (!searchResults) return [];
    return searchResults[category] || [];
  };

  return (
    <Dialog
      open={state.searchEnabled}
      onClose={handleClose}
      fullScreen={isPhone}
      sx={{ mt: 4, zIndex: (theme: Theme) => theme.zIndex.drawer + 1 }}
      scroll="paper"
      PaperProps={{
        sx: { flex: 1 },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: (theme: Theme) =>
              theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(2px)',
          },
        },
      }}
      TransitionComponent={Grow}
      TransitionProps={{ onEntered: handleEntered }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{ p: 1.5, backgroundColor: (theme: Theme) => theme.palette.background.paper }}
      >
        <TextField
          inputRef={ref}
          variant="outlined"
          autoFocus
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon icon={searchIcon} width="20" height="20" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end" onClick={handleClose}>
                {isSearching && <CircularProgress size={18} color="secondary" sx={{ mr: 1.5 }} />}
                <Box
                  component={ButtonBase}
                  sx={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.4rem',
                    border: 1,
                    borderColor: (theme: Theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                    backgroundColor: (theme: Theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    '&:hover': {
                      backgroundColor: (theme: Theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  esc
                </Box>
              </InputAdornment>
            ),
          }}
          placeholder="Search for songs, albums, artists..."
          size="small"
          sx={{
            flex: 1,
            backgroundColor: (theme: Theme) => theme.palette.background.default,
            borderRadius: 5,
          }}
        />
      </Stack>
      <DialogContent
        dividers={!!searchQuery}
        sx={{
          backgroundColor: (theme: Theme) => theme.palette.background.paper,
          p: 0,
        }}
      >
        <Collapse in={!searchQuery} timeout={{ enter: 1000, exit: 500 }}>
          <Box sx={{ p: 3, textAlign: 'center', flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Start typing to search across your music library
            </Typography>
          </Box>
        </Collapse>
        <Collapse in={!!searchQuery} timeout={{ enter: 1000, exit: 500 }}>
          <Box sx={{ p: 2 }}>
            {searchCategories.map(category => {
              const results = getSearchResults(category.type);
              if (results.length === 0) return null;
              return (
                <Box key={category.type} sx={{ mb: 3 }}>
                  <Typography
                    variant="overline"
                    sx={{
                      px: 0.5,
                      pb: 1.5,
                      display: 'block',
                      color: 'text.secondary',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {category.title}
                  </Typography>
                  <Grid container spacing={1}>
                    {results.map(result => {
                      const resultId = result.Id ?? result.id;
                      const title = (result.Title ?? result.title) as string | undefined;
                      const artistName = (result.ArtistName ?? result.artist) as string | undefined;
                      const albumTitle = (result.AlbumTitle ?? result.album) as string | undefined;
                      const songCount = result.songCount as number | undefined;
                      const albumCount = result.albumCount as number | undefined;
                      return (
                        <Grid item xs={12} key={resultId as React.Key}>
                          <Paper
                            component={ButtonBase}
                            onClick={() => handleResultClick(category, result)}
                            sx={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              px: 2,
                              py: 0.5,
                              borderRadius: 2,
                              textAlign: 'left',
                              backgroundColor: (theme: Theme) =>
                                theme.palette.mode === 'dark'
                                  ? 'rgba(255,255,255,0.05)'
                                  : 'rgba(0,0,0,0.03)',
                              transition: 'all 0.2s',
                              '&:hover': {
                                backgroundColor: (theme: Theme) =>
                                  theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,0.08)'
                                    : 'rgba(0,0,0,0.06)',
                                transform: 'translateY(-1px)',
                              },
                            }}
                            elevation={0}
                          >
                            <Icon
                              icon={category.icon}
                              height="1.5rem"
                              style={{ flexShrink: 0, opacity: 0.7 }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 500,
                                  fontSize: '0.95rem',
                                  mb: artistName || songCount || albumCount ? 0.25 : 0,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {title}
                              </Typography>
                              {(artistName || songCount || albumCount) && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    fontSize: '0.85rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {artistName
                                    ? `${artistName}${albumTitle ? ` • ${albumTitle}` : ''}`
                                    : songCount
                                      ? `${songCount} song${songCount !== 1 ? 's' : ''}`
                                      : albumCount
                                        ? `${albumCount} album${albumCount !== 1 ? 's' : ''}`
                                        : ''}
                                </Typography>
                              )}
                            </Box>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              );
            })}
            {!isSearching &&
              searchResults &&
              searchCategories.every(cat => getSearchResults(cat.type).length === 0) && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No results found for &quot;{searchQuery}&quot;
                  </Typography>
                </Box>
              )}
          </Box>
        </Collapse>
      </DialogContent>
    </Dialog>
  );
}
