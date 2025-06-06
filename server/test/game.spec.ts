import { describe, it, expect } from 'vitest';
import { applyPaddleMove } from '../src/game';
import type { GameState } from '../../shared/types';

describe('applyPaddleMove', () => {
  function blankState(): GameState {
    return {
      leftPaddleY: 0,
      rightPaddleY: 0,
      ballX: 0,
      ballY: 0,
      ballVX: 0,
      ballVY: 0,
      leftScore: 0,
      rightScore: 0,
    };
  }

  it('moves left paddle up and down', () => {
    const state = blankState();
    applyPaddleMove(state, 'left', 'up');
    expect(state.leftPaddleY).toBe(-5);
    applyPaddleMove(state, 'left', 'down');
    expect(state.leftPaddleY).toBe(0);
  });

  it('moves right paddle', () => {
    const state = blankState();
    applyPaddleMove(state, 'right', 'down');
    expect(state.rightPaddleY).toBe(5);
  });
});
