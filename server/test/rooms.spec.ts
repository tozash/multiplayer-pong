// GPT: server/test/rooms.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import {
  queuePlayer,
  removeSocket,
  __testReset,
} from '../src/rooms';

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
