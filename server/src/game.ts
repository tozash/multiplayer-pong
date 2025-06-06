// GPT: server/src/game.ts
import type { GameState, Role, PaddleDirection } from '../../shared/types.js';

export const GAME_HEIGHT = 400;
export const GAME_WIDTH = 600;
const PADDLE_HEIGHT = 80;
const PADDLE_OFFSET = 20;
const BALL_RADIUS = 5;
const INITIAL_BALL_SPEED_X = 3;
const INITIAL_BALL_SPEED_Y = 2;

const games: Record<string, GameState> = {};

function resetBall(state: GameState, direction: number) {
  state.ballX = 0;
  state.ballY = 0;
  state.ballVX = INITIAL_BALL_SPEED_X * direction;
  state.ballVY = INITIAL_BALL_SPEED_Y * (Math.random() > 0.5 ? 1 : -1);
}

export function createGame(roomId: string): GameState {
  const state: GameState = {
    leftPaddleY: 0,
    rightPaddleY: 0,
    ballX: 0,
    ballY: 0,
    ballVX: INITIAL_BALL_SPEED_X,
    ballVY: INITIAL_BALL_SPEED_Y,
    leftScore: 0,
    rightScore: 0,
  };
  games[roomId] = state;
  return state;
}

export function getGame(roomId: string): GameState | undefined {
  return games[roomId];
}

export function getAllGames(): [string, GameState][] {
  return Object.entries(games);
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
    state.leftPaddleY = Math.max(
      -GAME_HEIGHT / 2 + PADDLE_HEIGHT / 2,
      Math.min(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, state.leftPaddleY),
    );
  } else {
    state.rightPaddleY += dir === 'up' ? -step : step;
    state.rightPaddleY = Math.max(
      -GAME_HEIGHT / 2 + PADDLE_HEIGHT / 2,
      Math.min(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, state.rightPaddleY),
    );
  }
  return state;
}

export function stepGame(state: GameState): GameState {
  state.ballX += state.ballVX;
  state.ballY += state.ballVY;

  if (state.ballY <= -GAME_HEIGHT / 2 + BALL_RADIUS || state.ballY >= GAME_HEIGHT / 2 - BALL_RADIUS) {
    state.ballVY *= -1;
  }

  const leftPaddleX = -GAME_WIDTH / 2 + PADDLE_OFFSET;
  const rightPaddleX = GAME_WIDTH / 2 - PADDLE_OFFSET;

  if (
    state.ballX - BALL_RADIUS <= leftPaddleX &&
    state.ballX - BALL_RADIUS >= leftPaddleX - Math.abs(state.ballVX) &&
    Math.abs(state.ballY - state.leftPaddleY) <= PADDLE_HEIGHT / 2
  ) {
    state.ballVX = Math.abs(state.ballVX);
  }

  if (
    state.ballX + BALL_RADIUS >= rightPaddleX &&
    state.ballX + BALL_RADIUS <= rightPaddleX + Math.abs(state.ballVX) &&
    Math.abs(state.ballY - state.rightPaddleY) <= PADDLE_HEIGHT / 2
  ) {
    state.ballVX = -Math.abs(state.ballVX);
  }

  if (state.ballX < -GAME_WIDTH / 2) {
    state.rightScore += 1;
    resetBall(state, -1);
  } else if (state.ballX > GAME_WIDTH / 2) {
    state.leftScore += 1;
    resetBall(state, 1);
  }

  return state;
}
