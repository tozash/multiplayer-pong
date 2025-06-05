// GPT: server/src/game.ts
import type { GameState, Role, PaddleDirection } from '../../shared/types.js';

const games: Record<string, GameState> = {};

export function createGame(roomId: string): GameState {
  const state: GameState = { leftPaddleY: 0, rightPaddleY: 0 };
  games[roomId] = state;
  return state;
}

export function getGame(roomId: string): GameState | undefined {
  return games[roomId];
}

export function removeGame(roomId: string): void {
  delete games[roomId];
}

export function applyPaddleMove(
  state: GameState,
  role: Role,
  dir: PaddleDirection,
): GameState {
  const step = 5;
  if (role === 'left') {
    state.leftPaddleY += dir === 'up' ? -step : step;
  } else {
    state.rightPaddleY += dir === 'up' ? -step : step;
  }
  return state;
}
