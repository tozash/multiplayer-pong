import { describe, it, expect } from 'vitest';
import { io as Client } from 'socket.io-client';
import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import { getFreePort } from './utils/getFreePort';

describe('Socket.IO pairing integration', () => {
  it('pairs two clients and emits room_ready with correct roles', async () => {
    const port = await getFreePort();
    const app = express();
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });
    // Inline rooms logic for isolation
    const queue: string[] = [];
    const rooms: Record<string, { left: string; right: string }> = {};
    const socketToRoom: Record<string, string> = {};
    function generateRoomId() {
      return Math.random().toString(36).slice(2, 10);
    }
    function queuePlayer(socketId: string) {
      if (queue.length === 0) {
        queue.push(socketId);
        return { status: 'waiting' };
      } else {
        const left = queue.shift()!;
        const right = socketId;
        const roomId = generateRoomId();
        rooms[roomId] = { left, right };
        socketToRoom[left] = roomId;
        socketToRoom[right] = roomId;
        return { status: 'paired', roomId, left, right };
      }
    }
    function removeSocket(socketId: string) {
      const idx = queue.indexOf(socketId);
      if (idx !== -1) queue.splice(idx, 1);
      const roomId = socketToRoom[socketId];
      if (roomId) {
        const room = rooms[roomId];
        if (room) {
          if (room.left === socketId || room.right === socketId) {
            delete rooms[roomId];
            if (room.left) delete socketToRoom[room.left];
            if (room.right) delete socketToRoom[room.right];
          }
        }
      }
      delete socketToRoom[socketId];
    }
    io.on('connection', (socket) => {
      const result = queuePlayer(socket.id);
      if (result.status === 'waiting') {
        socket.emit('waiting');
      } else if (result.status === 'paired') {
        const { roomId, left, right } = result;
        if (left && right) {
          io.to(left).emit('room_ready', { roomId, role: 'left' });
          io.to(right).emit('room_ready', { roomId, role: 'right' });
        }
      }
      socket.on('disconnect', () => {
        removeSocket(socket.id);
      });
    });
    await new Promise<void>((resolve) => httpServer.listen(port, () => resolve()));
    const { io: ClientIO } = await import('socket.io-client');
    const client1 = ClientIO(`http://localhost:${port}`);
    const client2 = ClientIO(`http://localhost:${port}`);
    let room1: any = null;
    let room2: any = null;
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout')), 3000);
      client1.on('room_ready', (data: any) => {
        room1 = data;
        if (room1 && room2) done();
      });
      client2.on('room_ready', (data: any) => {
        room2 = data;
        if (room1 && room2) done();
      });
      function done() {
        try {
          expect(room1.roomId).toBe(room2.roomId);
          expect([room1.role, room2.role].sort().join(','))
            .toBe('left,right');
          clearTimeout(timeout);
          resolve();
        } catch (e) {
          clearTimeout(timeout);
          reject(e);
        }
      }
    });
    client1.close();
    client2.close();
    io.close();
    httpServer.close();
  }, 3000);
}); 