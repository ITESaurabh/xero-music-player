import React, { useContext, useEffect, useCallback, useMemo, useState } from 'react';
import { Box, LinearProgress, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router';
import { FixedSizeGrid, GridChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import PageToolbar from '../components/PageToolbar';
import { useIpc } from '../state/ipc';
import { QUERY_KEYS } from '../constants/queryKeys';
import { store } from '../utils/store';
import { useScrollHidePlayerBar } from '../utils/useScrollHidePlayerBar';

export interface Album {
  Id: number;
  Title: string;
  CoverUri: string | null;
  ReleaseYear: number | null;
  ArtistName: string | null;
  SongCount: number;
}

const CARD_MIN_WIDTH = 148;
const GAP = 14;
const PADDING = 16;
const TEXT_AREA_HEIGHT = 56;

// AutoSizer already gives the inner content width (Box padding is excluded),
// so we use containerWidth directly. We distribute ALL gaps (colCount of them)
// so total grid width = colCount * (colWidth + GAP) = containerWidth exactly.
function calcLayout(containerWidth: number): {
  colCount: number;
  colWidth: number;
  rowHeight: number;
} {
  const colCount = Math.max(2, Math.floor((containerWidth + GAP) / (CARD_MIN_WIDTH + GAP)));
  const colWidth = Math.floor((containerWidth - colCount * GAP) / colCount);
  const rowHeight = colWidth + TEXT_AREA_HEIGHT + GAP; // art + text + top-gap padding
  return { colCount, colWidth, rowHeight };
}

interface AlbumCardProps {
  album: Album;
  width: number;
  onClick: (_album: Album) => void;
}

const AlbumCard: React.FC<AlbumCardProps> = React.memo(({ album, width, onClick }) => {
  const artSize = width;
  const theme = useTheme();

  return (
    <Box
      onClick={() => onClick(album)}
      component={motion.div}
      whileHover={{ scale: 0.97 }}
      sx={{
        width,
        cursor: 'pointer',
        borderRadius: 0.5,
        overflow: 'hidden',
        backgroundColor: theme.palette.background.default,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {/* Album Art */}
      <Box
        sx={{
          width: artSize,
          height: artSize,
          position: 'relative',
          borderRadius: 0.5,
          overflow: 'hidden',
          backgroundColor: '#1a1a2e',
          flexShrink: 0,
        }}
      >
        {album.CoverUri ? (
          <img
            src={`file://${album.CoverUri}`}
            alt={album.Title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1e1e3f 0%, #2d2d5a 100%)',
            }}
          >
            <Typography
              sx={{
                fontSize: artSize * 0.38,
                opacity: 0.25,
                userSelect: 'none',
                lineHeight: 1,
              }}
            >
              ♪
            </Typography>
          </Box>
        )}
        {/* Hover overlay */}
        <Box
          className="album-art-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.15s ease',
          }}
        >
          <Typography sx={{ fontSize: artSize * 0.28, lineHeight: 1 }}>▶</Typography>
        </Box>
      </Box>

      {/* Text */}
      <Box display={'flex'} py={0.75} px={1} gap={0.7} flexDirection={'column'}>
        <Typography
          variant="body2"
          noWrap
          sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary', lineHeight: 1 }}
        >
          {album.Title || 'Unknown Album'}
        </Typography>
        <Typography
          variant="caption"
          noWrap
          sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1 }}
        >
          {album.ArtistName || 'Unknown Artist'}
        </Typography>
      </Box>
    </Box>
  );
});

AlbumCard.displayName = 'AlbumCard';

interface CellData {
  albums: Album[];
  colCount: number;
  colWidth: number;
  onClick: (_album: Album) => void;
}

const Cell = React.memo(
  ({ columnIndex, rowIndex, style, data }: GridChildComponentProps<CellData>) => {
    const { albums, colCount, colWidth, onClick } = data;
    const idx = rowIndex * colCount + columnIndex;
    if (idx >= albums.length) return null;
    const album = albums[idx];

    return (
      <div
        style={{
          ...style,
          paddingRight: GAP,
          paddingTop: GAP,
          boxSizing: 'border-box',
        }}
      >
        <AlbumCard album={album} width={colWidth} onClick={onClick} />
      </div>
    );
  }
);
Cell.displayName = 'Cell';

const Albums: React.FC = () => {
  const { invokeEventToMainProcess } = useIpc();
  const { dispatch } = useContext(store);
  const navigate = useNavigate();

  const handleGridScroll = useScrollHidePlayerBar<{ scrollTop: number }>({ field: 'scrollTop' });

  const {
    data: albums = [] as Album[],
    isLoading,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.ALL_ALBUMS],
    queryFn: () => invokeEventToMainProcess('get-all-albums', undefined) as Promise<Album[]>,
  });

  useEffect(() => {
    dispatch({ type: 'SET_PLAYER_BAR_VISIBLE', payload: true });
  }, [dispatch]);

  const handleAlbumClick = useCallback(
    (album: Album) => {
      navigate(`/main_window/albums/${album.Id}`);
    },
    [navigate]
  );

  const [gridLayout, setGridLayout] = useState(() => calcLayout(800));

  const handleResize = useCallback(({ width }: { width: number }) => {
    setGridLayout(prev => {
      const next = calcLayout(width);
      if (next.colCount === prev.colCount && next.colWidth === prev.colWidth) return prev;
      return next;
    });
  }, []);

  const itemData = useMemo<CellData>(
    () => ({
      albums,
      colCount: gridLayout.colCount,
      colWidth: gridLayout.colWidth,
      onClick: handleAlbumClick,
    }),
    [albums, gridLayout, handleAlbumClick]
  );

  if (isLoading)
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <PageToolbar title="Albums" />
        <LinearProgress color="primary" sx={{ borderRadius: 1 }} />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <PageToolbar title="Albums" />
        <Typography sx={{ p: 3, color: 'error.main' }}>Error loading albums</Typography>
      </Box>
    );

  return (
    <Box
      component={motion.div}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.3 }}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <PageToolbar title={`Albums (${albums.length})`} />

      <Box sx={{ flex: 1, minHeight: 0, px: `${PADDING}px` }}>
        <AutoSizer onResize={handleResize}>
          {({ height, width }: { height: number; width: number }) => {
            const { colCount, colWidth, rowHeight } = calcLayout(width);
            const rowCount = Math.ceil(albums.length / colCount);

            return (
              <FixedSizeGrid
                columnCount={colCount}
                columnWidth={colWidth + GAP}
                rowCount={rowCount}
                rowHeight={rowHeight}
                height={height}
                width={width}
                overscanRowCount={4}
                onScroll={handleGridScroll}
                itemData={itemData}
                style={{ overflowX: 'hidden' }}
              >
                {Cell}
              </FixedSizeGrid>
            );
          }}
        </AutoSizer>
      </Box>
    </Box>
  );
};

export default Albums;
