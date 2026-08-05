import { io } from 'socket.io-client';
import { CONFIG } from '@/constants/config';

// Socket.IO client — connects to the backend Socket.IO server.
// autoConnect: false so we control when to connect (after auth).
// Auth token is read lazily at connect-time so it's always fresh.
export const socket = io(CONFIG.SOCKET_URL, {
  autoConnect: false,
  auth: (cb) => {
    cb({ token: localStorage.getItem(CONFIG.TOKEN_KEY) });
  },
});
