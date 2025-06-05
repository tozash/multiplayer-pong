// GPT: server/test/game.spec.ts
import { describe, it, expect } from 'vitest';
import { applyPaddleMove } from '../src/game';
import type { GameState } from '../../shared/types';

describe('applyPaddleMove', () => {
  it('moves left paddle up and down', () => {
    const state: GameState = { leftPaddleY: 0, rightPaddleY: 0 };
    applyPaddleMove(state, 'left', 'up');
    expect(state.leftPaddleY).toBe(-5);
    applyPaddleMove(state, 'left', 'down');
    expect(state.leftPaddleY).toBe(0);
  });

  it('moves right paddle', () => {
    const state: GameState = { leftPaddleY: 0, rightPaddleY: 0 };
    applyPaddleMove(state, 'right', 'down');
    expect(state.rightPaddleY).toBe(5);
  });
});
