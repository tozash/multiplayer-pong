// GPT: server/test/rooms.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import {
  queuePlayer,
  removeSocket,
} from '../src/rooms.js';

// Test utilities
const queue: string[] = [];
const rooms: Record<string, { left: string; right: string }> = {};
const socketToRoom: Record<string, string> = {};

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
