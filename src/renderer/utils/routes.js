import React, { lazy } from 'react';
import Layout from '../components/Layout';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
const AllSongs = lazy(() => import('../views/AllSongs'));
const Albums = lazy(() => import('../views/Albums'));
const Search = lazy(() => import('../views/Search'));

const BigLoader = () => {
  return (
    <Box
      sx={{
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
      }}
    >
      <CircularProgress />
    </Box>
  );
};

const routes = [
  {
    path: '/main_window',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <React.Suspense fallback={BigLoader}>
            <AllSongs />
          </React.Suspense>
        ),
      },
      {
        path: 'favourites',
        element: (
          <React.Suspense fallback={BigLoader}>
            <Search />
          </React.Suspense>
        ),
      },
      {
        path: 'playlists',
        element: (
          <React.Suspense fallback={BigLoader}>
            <Search />
          </React.Suspense>
        ),
      },
      {
        path: 'albums',
        element: (
          <React.Suspense fallback={BigLoader}>
            <Albums />
          </React.Suspense>
        ),
      },
      {
        path: 'artists',
        element: (
          <React.Suspense fallback={BigLoader}>
            <Search />
          </React.Suspense>
        ),
      },
      {
        path: 'album-artists',
        element: (
          <React.Suspense fallback={BigLoader}>
            <Search />
          </React.Suspense>
        ),
      },
      {
        path: 'folders',
        element: (
          <React.Suspense fallback={BigLoader}>
            <Search />
          </React.Suspense>
        ),
      },
      {
        path: 'folder-hierarchy',
        element: (
          <React.Suspense fallback={BigLoader}>
            <Search />
          </React.Suspense>
        ),
      },
      {
        path: 'genres',
        element: (
          <React.Suspense fallback={BigLoader}>
            <Search />
          </React.Suspense>
        ),
      },
      {
        path: 'years',
        element: (
          <React.Suspense fallback={BigLoader}>
            <Search />
          </React.Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <React.Suspense fallback={BigLoader}>
            <Search />
          </React.Suspense>
        ),
      },
    ],
  },
  { path: '*', element: <Navigate to="main_window" /> },
];

export default routes /* .filter((route) => route.enabled) */;
