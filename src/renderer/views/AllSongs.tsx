import React, { useContext, useRef, useEffect } from 'react';
import {
  Container,
  Button,
  useMediaQuery,
  ListItemButton,
  Box,
  Grid,
  LinearProgress,
  Theme,
  Typography,
} from '@mui/material';
import filterIcon from '@iconify/icons-fluent/filter-24-filled';
import { Icon } from '@iconify/react';
import PageToolbar from '../components/PageToolbar';
import { useIpc } from '../state/ipc';
import { store, Track } from '../utils/store';
import { QUERY_KEYS } from '../constants/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { motion } from 'motion/react';

interface Column {
  label: string;
  key: string;
  width: number;
}

const columns: Column[] = [
  { label: 'Title', key: 'Title', width: 180 },
  { label: 'Artist', key: 'ArtistName', width: 140 },
  { label: 'Album', key: 'AlbumTitle', width: 140 },
  { label: 'Year', key: 'Year', width: 80 },
  { label: 'Genre', key: 'GenreName', width: 100 },
  { label: 'Duration', key: 'Duration', width: 60 },
];

const getVisibleColumns = (isPhone: boolean): Column[] => (isPhone ? columns.slice(0, 2) : columns);

const getFlex = (col: Column, isPhone: boolean): number => {
  if (isPhone) return 1;
  if (col.label === 'Title') return 2;
  return 1;
};

interface HeaderRowProps {
  isPhone: boolean;
}

const HeaderRow: React.FC<HeaderRowProps> = ({ isPhone }) => {
  const visibleColumns = getVisibleColumns(isPhone);
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        background: '#222',
        color: '#fff',
        fontWeight: 500,
      }}
    >
      {visibleColumns.map(col => (
        <div
          key={col.label}
          style={{
            flex: getFlex(col, isPhone),
            padding: '8px 16px',
            textAlign: col.label === 'Title' ? 'left' : 'right',
            minWidth: col.width,
          }}
        >
          {col.label}
        </div>
      ))}
    </div>
  );
};

const AllSongs: React.FC = () => {
  const isPhone = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const { invokeEventToMainProcess } = useIpc();
  const { dispatch, state } = useContext(store);
  const lastScrollTop = useRef<number>(0);

  const {
    data: songs = [] as Track[],
    isLoading,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.ALL_SONGS],
    queryFn: () => invokeEventToMainProcess('get-all-songs', undefined) as Promise<Track[]>,
  });

  // Show player bar when component mounts or unmounts
  useEffect(() => {
    dispatch({ type: 'SET_PLAYER_BAR_VISIBLE', payload: true });
    return () => {
      dispatch({ type: 'SET_PLAYER_BAR_VISIBLE', payload: true });
    };
  }, [dispatch]);

  const handleScroll = ({ scrollOffset }: { scrollOffset: number }): void => {
    // Only hide/show if scrolled more than 250px
    if (scrollOffset > 250) {
      // Scrolling down
      if (scrollOffset > lastScrollTop.current) {
        dispatch({ type: 'SET_PLAYER_BAR_VISIBLE', payload: false });
      }
      // Scrolling up
      else if (scrollOffset < lastScrollTop.current) {
        dispatch({ type: 'SET_PLAYER_BAR_VISIBLE', payload: true });
      }
    } else {
      // Near top, always show
      dispatch({ type: 'SET_PLAYER_BAR_VISIBLE', payload: true });
    }

    lastScrollTop.current = scrollOffset;
  };

  const handleSongClick = React.useCallback(
    (clickedIndex: number): void => {
      dispatch({
        type: 'SET_QUEUE',
        payload: { queue: songs, index: clickedIndex },
      });
      dispatch({ type: 'SET_CURR_TRACK', payload: songs[clickedIndex] });
      dispatch({ type: 'SET_IS_PLAYING', payload: true });
    },
    [songs, dispatch]
  );

  const Row = React.useCallback(
    ({ index, style }: ListChildComponentProps) => {
      const song = songs[index];
      const visibleColumns = getVisibleColumns(isPhone);

      return (
        <ListItemButton
          style={style}
          selected={song.Id === state.track?.Id}
          sx={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            borderBottom: '1px solid #333',
            background: index % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
            '&:hover': {
              background: 'rgba(255,255,255,0.08)',
            },
          }}
          key={song.Id != null ? String(song.Id) : index}
          onClick={() => handleSongClick(index)}
        >
          {visibleColumns.map(col => (
            <Box
              key={col.label}
              sx={{
                flex: getFlex(col, isPhone),
                px: 2,
                textAlign: col.label === 'Title' ? 'left' : 'right',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              <Typography variant="body2" noWrap>
                {(song[col.key] as string) || ''}
              </Typography>
            </Box>
          ))}
        </ListItemButton>
      );
    },
    [songs, dispatch, isPhone, state.track?.Id, handleSongClick]
  );

  if (isLoading)
    return (
      <div>
        <LinearProgress
          color="primary"
          sx={{
            borderRadius: 1,
          }}
        />
      </div>
    );
  if (error) return <div>Error fetching songs</div>;

  return (
    <Grid
      component={motion.div}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.3 }}
      item
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <PageToolbar
        title="All Songs"
        action={
          <Button variant="contained" startIcon={<Icon icon={filterIcon} />}>
            Filter
          </Button>
        }
      />
      <Container
        maxWidth="xl"
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
        <HeaderRow isPhone={isPhone} />
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <AutoSizer>
            {({ height, width }: { height: number; width: number }) => (
              <FixedSizeList
                height={height}
                overscanCount={100}
                itemCount={songs.length}
                itemSize={43}
                width={width}
                onScroll={handleScroll}
              >
                {Row}
              </FixedSizeList>
            )}
          </AutoSizer>
        </Box>
      </Container>
    </Grid>
  );
};

export default AllSongs;
