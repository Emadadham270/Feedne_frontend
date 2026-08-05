import { MOCK_USERS } from './users';

/** @type {import('../types/chat.types').Conversation[]} */
export const MOCK_CONVERSATIONS = [
  {
    id: 'conv1',
    participant: MOCK_USERS[1],
    lastMessage: {
      id: 'm_last1',
      senderId: 'u2',
      text: 'Just dropped a new post! Check it out 📸',
      status: 'read',
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'conv2',
    participant: MOCK_USERS[4],
    lastMessage: {
      id: 'm_last2',
      senderId: 'u5',
      text: 'The Amalfi shots are 🔥🔥🔥',
      status: 'delivered',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    unreadCount: 3,
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'conv3',
    participant: MOCK_USERS[5],
    lastMessage: {
      id: 'm_last3',
      senderId: 'u1',
      text: 'Love your latest artwork!',
      status: 'read',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

/** @type {Record<string, import('../types/chat.types').Message[]>} */
export const MOCK_MESSAGES = {
  conv1: [
    {
      id: 'm1',
      senderId: 'u1',
      text: 'Hey Selena! Love your recent posts 🙌',
      status: 'read',
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
    {
      id: 'm2',
      senderId: 'u2',
      text: 'Aww thank you so much! That means a lot 💕',
      status: 'read',
      createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    },
    {
      id: 'm3',
      senderId: 'u2',
      text: 'Just dropped a new post! Check it out 📸',
      status: 'read',
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
  ],
  conv2: [
    {
      id: 'm4',
      senderId: 'u5',
      text: 'The Amalfi shots are 🔥🔥🔥',
      status: 'delivered',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ],
};
