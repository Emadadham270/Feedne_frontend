// Route path constants — import these instead of hardcoding strings
export const ROUTES = {
  HOME: '/',
  EXPLORE: '/explore',
  TRENDING: '/trending',
  PROFILE: '/profile/:username',
  PROFILE_VIEW: (username) => `/profile/${username}`,
  SETTINGS: '/settings',
  MESSAGES: '/messages',
  MESSAGES_CHAT: '/messages/:chatId',
  NOTIFICATIONS: '/notifications',
  LOGIN: '/login',
  SIGNUP: '/signup',
};
