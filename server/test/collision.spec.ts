import { describe, it, expect } from 'vitest';
import { stepGame, GAME_HEIGHT, GAME_WIDTH } from '../src/game';
import type { GameState } from '../../shared/types';

function baseState(): GameState {
  return {
    leftPaddleY: 0,
    rightPaddleY: 0,
    ballX: 0,
    ballY: 0,
    ballVX: 1,
    ballVY: 1,
    leftScore: 0,
    rightScore: 0,
  };
}

describe('stepGame collision logic', () => {
  it('bounces off top wall', () => {
    const state = baseState();
    state.ballY = GAME_HEIGHT / 2 - 1;
    state.ballVY = 2;
    stepGame(state);
    expect(state.ballVY).toBe(-2);
  });

  it('increments score when ball passes right wall', () => {
    const state = baseState();
    state.ballX = GAME_WIDTH / 2 + 1;
    stepGame(state);
    expect(state.leftScore).toBe(1);
    expect(state.ballX).toBe(0);
  });

  it('bounces off left paddle', () => {
    const state = baseState();
    state.ballX = -GAME_WIDTH / 2 + 26; // near left paddle and moving left
    state.ballVX = -2;
    stepGame(state);
    expect(state.ballVX).toBeGreaterThan(0);
  });
});
