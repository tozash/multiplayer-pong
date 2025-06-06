import { useRef, useEffect } from 'react';
import type { GameState } from '../../shared/types';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  BALL_RADIUS,
  PADDLE_OFFSET,
} from './constants';

interface Props {
  state: GameState;
}

export default function GameCanvas({ state }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = 'white';

    // left paddle
    ctx.fillRect(
      PADDLE_OFFSET,
      GAME_HEIGHT / 2 + state.leftPaddleY - PADDLE_HEIGHT / 2,
      PADDLE_WIDTH,
      PADDLE_HEIGHT,
    );

    // right paddle
    ctx.fillRect(
      GAME_WIDTH - PADDLE_OFFSET - PADDLE_WIDTH,
      GAME_HEIGHT / 2 + state.rightPaddleY - PADDLE_HEIGHT / 2,
      PADDLE_WIDTH,
      PADDLE_HEIGHT,
    );

    // ball
    ctx.beginPath();
    ctx.arc(
      GAME_WIDTH / 2 + state.ballX,
      GAME_HEIGHT / 2 + state.ballY,
      BALL_RADIUS,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      width={GAME_WIDTH}
      height={GAME_HEIGHT}
      style={{ backgroundColor: 'black' }}
    />
  );
}
