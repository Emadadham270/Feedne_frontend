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
  GROUP: '/groups/:groupId',
  GROUP_VIEW: (groupId) => `/groups/${groupId}`,
  GROUP_JOIN: '/groups/join/:code',
  GROUP_JOIN_VIEW: (code) => `/groups/join/${code}`,
  LOGIN: '/login',
  SIGNUP: '/signup',
  ADMIN: '/admin',
  LANDING: '/landing',
};

