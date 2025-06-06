import { useEffect, useState } from 'react';
import { io as ClientIO } from 'socket.io-client';
import type { GameState } from '../../shared/types';

const socket = ClientIO('http://localhost:4000');

type Role = 'left' | 'right';

type Screen =
  | { status: 'disconnected' }
  | { status: 'connected' }
  | { status: 'waiting' }
  | { status: 'room_ready'; role: Role; roomId: string };

function App() {
  const [screen, setScreen] = useState<Screen>({ status: 'disconnected' });
  const [game, setGame] = useState<GameState>({
    leftPaddleY: 0,
    rightPaddleY: 0,
    ballX: 0,
    ballY: 0,
    ballVX: 0,
    ballVY: 0,
    leftScore: 0,
    rightScore: 0,
  });

  useEffect(() => {
    socket.on('handshake', (data) => {
      console.log('Server handshake:', data);
      setScreen({ status: 'connected' });
    });
    socket.on('waiting', () => {
      setScreen({ status: 'waiting' });
    });
    socket.on('room_ready', (data: { roomId: string; role: Role }) => {
      setScreen({ status: 'room_ready', role: data.role, roomId: data.roomId });
    });
    socket.on('state_tick', (state: GameState) => {
      setGame(state);
    });
    return () => {
      socket.off('handshake');
      socket.off('waiting');
      socket.off('room_ready');
      socket.off('state_tick');
    };
  }, []);

  useEffect(() => {
    if (screen.status !== 'room_ready') return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        socket.emit('paddle_move', { dir: 'up', roomId: screen.roomId });
      } else if (e.key === 'ArrowDown') {
        socket.emit('paddle_move', { dir: 'down', roomId: screen.roomId });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [screen]);

  let content: React.ReactNode = null;
  if (screen.status === 'disconnected') {
    content = <span>Disconnected</span>;
  } else if (screen.status === 'connected') {
    content = <span>Connected</span>;
  } else if (screen.status === 'waiting') {
    content = <span>Waiting for opponent…</span>;
  } else if (screen.status === 'room_ready') {
    content = (
      <div>
        <div>Game starting — you're {screen.role}</div>
        <div>Left: {game.leftPaddleY}</div>
        <div>Right: {game.rightPaddleY}</div>
        <div>Ball: {game.ballX}, {game.ballY}</div>
        <div>Score: {game.leftScore} - {game.rightScore}</div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        padding: '2rem',
        borderRadius: '8px',
        backgroundColor: '#222',
        color: 'white',
        fontSize: '1.5rem',
        minWidth: '320px',
        textAlign: 'center',
      }}>
        {content}
      </div>
    </div>
  );
}

export default App; 
