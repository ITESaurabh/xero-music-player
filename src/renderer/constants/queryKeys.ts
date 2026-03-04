export const QUERY_KEYS = {
  ALL_SONGS: 'ALL-SONGS',
  ALL_ALBUMS: 'ALL-ALBUMS',
  ALBUM_SONGS: 'ALBUM-SONGS',
} as const;

export type QueryKey = typeof QUERY_KEYS[keyof typeof QUERY_KEYS];
