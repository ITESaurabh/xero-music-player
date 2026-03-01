export const QUERY_KEYS = {
  ALL_SONGS: 'ALL-SONGS',
} as const;

export type QueryKey = typeof QUERY_KEYS[keyof typeof QUERY_KEYS];
