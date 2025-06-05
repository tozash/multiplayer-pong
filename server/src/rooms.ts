
// GPT: server/test/rooms.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import type { Role } from '../../shared/types.js';
// In-memory state
const queue: string[] = [];
const rooms: Record<string, { left: string; right: string }> = {};
const socketToRoom: Record<string, string> = {};

function generateRoomId() {
  return Math.random().toString(36).slice(2, 10);
}

function queuePlayer(socketId: string) {
  if (queue.length === 0) {
    queue.push(socketId);
    return { status: 'waiting' } as const;
  } else {
    const left = queue.shift()!;
    const right = socketId;
    const roomId = generateRoomId();
    rooms[roomId] = { left, right };
    socketToRoom[left] = roomId;
    socketToRoom[right] = roomId;
    return { status: 'paired', roomId, left, right } as const;
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

function getRoomAndRole(socketId: string): { roomId: string; role: Role } | null {
  const roomId = socketToRoom[socketId];
  if (!roomId) return null;
  const room = rooms[roomId];
  if (!room) return null;
  const role: Role = room.left === socketId ? 'left' : 'right';
  return { roomId, role };
}

function __testReset() {
  queue.length = 0;
  Object.keys(rooms).forEach(key => delete rooms[key]);
  Object.keys(socketToRoom).forEach(key => delete socketToRoom[key]);
}

export { queuePlayer, removeSocket, getRoomAndRole, __testReset };

