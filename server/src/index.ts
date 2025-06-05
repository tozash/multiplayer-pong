import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { queuePlayer } from './rooms';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
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
    }
  }
  socket.on('disconnect', () => {
    socket.emit('disconnect');
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 