// GPT: shared/types.ts
export type Role = 'left' | 'right';
export type PaddleDirection = 'up' | 'down';

export interface RoomReadyPayload {
  roomId: string;
  role: Role;
}

export interface PaddleMovePayload {
  roomId: string;
  dir: PaddleDirection;
}

export interface GameState {
  leftPaddleY: number;
  rightPaddleY: number;
}

export interface ServerToClientEvents {
  handshake: (payload: { ok: true }) => void;
  waiting: () => void;
  room_ready: (payload: RoomReadyPayload) => void;
  state_tick: (state: GameState) => void;
}

export interface ClientToServerEvents {
  paddle_move: (payload: PaddleMovePayload) => void;
}
