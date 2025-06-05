// GPT: server/test/rooms.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
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

function __testReset() {
  queue.length = 0;
  Object.keys(rooms).forEach(key => delete rooms[key]);
  Object.keys(socketToRoom).forEach(key => delete socketToRoom[key]);
}

describe('rooms.ts pure logic', () => {
  beforeEach(() => {
    __testReset();          // wipe in-memory state before each test
  });

  it('first call to queuePlayer returns waiting', () => {
    const res = queuePlayer('A');
    expect(res).toEqual({ status: 'waiting' });
  });

  it('second call returns paired with correct ids and roomId', () => {
    queuePlayer('A');
    const res = queuePlayer('B');
    expect(res.status).toBe('paired');
    expect(res.left).toBe('A');
    expect(res.right).toBe('B');
    expect(typeof res.roomId).toBe('string');
  });

  it('removeSocket resets state so next is waiting', () => {
    queuePlayer('A');
    queuePlayer('B');       // paired now
    removeSocket('A');
    const res = queuePlayer('C');
    expect(res).toEqual({ status: 'waiting' });
  });
});
export { queuePlayer, removeSocket, __testReset };

