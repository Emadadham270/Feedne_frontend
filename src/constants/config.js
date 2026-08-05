// App-wide configuration — swap API_BASE_URL for production
export const CONFIG = {
  APP_NAME: 'Feedne',
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001',
  TOKEN_KEY: 'feedne_token',
  REFRESH_TOKEN_KEY: 'feedne_refresh_token',
  USER_KEY: 'feedne_user',

  PAGINATION: {
    DEFAULT_LIMIT: 10,
    EXPLORE_LIMIT: 20,
  },

  UPLOAD: {
    MAX_SIZE_MB: 50,
    ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
  },
};

export const EXPLORE_CATEGORIES = [
  'For You',
  'Trending',
  'Music',
  'Art',
  'Fashion',
  'Travel',
  'Food',
  'Tech',
];
