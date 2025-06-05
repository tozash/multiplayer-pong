import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { queuePlayer, removeSocket, getRoomAndRole } from './rooms';
import { createGame, getGame, applyPaddleMove, removeGame } from './game';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../../shared/types.js';

const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// TODO: Add game state management per room
// TODO: Implement paddle/ball sync events
// TODO: Add admin/debug endpoints

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('handshake', { ok: true });

  // Pairing logic
  const result = queuePlayer(socket.id);
  if (result.status === 'waiting') {
    socket.emit('waiting');
  } else if (result.status === 'paired') {
    // Notify both clients
    const { roomId, left, right } = result;
    if (left && right) {
      io.to(left).emit('room_ready', { roomId, role: 'left' });
      io.to(right).emit('room_ready', { roomId, role: 'right' });
      createGame(roomId);
    }
  }

  socket.on('paddle_move', (payload) => {
    const info = getRoomAndRole(socket.id);
    if (!info) return;
    const game = getGame(info.roomId);
    if (!game) return;
    applyPaddleMove(game, info.role, payload.dir);
    io.to(info.roomId).emit('state_tick', game);
  });
  socket.on('disconnect', () => {
    const info = getRoomAndRole(socket.id);
    if (info) {
      removeGame(info.roomId);
    }
    removeSocket(socket.id);
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 