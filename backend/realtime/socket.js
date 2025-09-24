// realtime/socket.js
import { Server } from 'socket.io';

let io = null;

export function createSocketServer(server, allowedOrigins = '*') {
  io = new Server(server, {
    cors: {
      origin: Array.isArray(allowedOrigins) ? allowedOrigins : allowedOrigins === '*' ? '*' : [allowedOrigins],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Optionally join rooms based on user or role
    socket.on('join', (payload = {}) => {
      try {
        const { userId, role } = payload;
        if (userId) socket.join(`user:${userId}`);
        if (role) socket.join(`role:${role}`);
      } catch (_) {}
    });
  });

  return io;
}

export function getIO() {
  return io;
}