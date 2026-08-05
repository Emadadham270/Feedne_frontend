import { MOCK_USERS } from './users';

/** @type {import('../types/notification.types').Notification[]} */
export const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'like',
    actor: MOCK_USERS[1],
    postId: 'p3',
    message: 'liked your post',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'n2',
    type: 'follow',
    actor: MOCK_USERS[5],
    postId: null,
    message: 'started following you',
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'n3',
    type: 'comment',
    actor: MOCK_USERS[2],
    postId: 'p1',
    message: 'commented on your post: "Absolutely stunning shot!"',
    isRead: false,
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: 'n4',
    type: 'mention',
    actor: MOCK_USERS[4],
    postId: 'p7',
    message: 'mentioned you in a post',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n5',
    type: 'like',
    actor: MOCK_USERS[6],
    postId: 'p1',
    message: 'liked your post',
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n6',
    type: 'trending',
    actor: MOCK_USERS[7],
    postId: 'p4',
    message: 'Your post is trending in Music 🔥',
    isRead: true,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
];
