import { useEffect, useState } from 'react';
import { io as ClientIO } from 'socket.io-client';

const socket = ClientIO('http://localhost:4000');

type Role = 'left' | 'right';

type Screen =
  | { status: 'disconnected' }
  | { status: 'connected' }
  | { status: 'waiting' }
  | { status: 'room_ready'; role: Role };

function App() {
  const [screen, setScreen] = useState<Screen>({ status: 'disconnected' });

  useEffect(() => {
    socket.on('handshake', (data) => {
      console.log('Server handshake:', data);
      setScreen({ status: 'connected' });
    });
    socket.on('waiting', () => {
      setScreen({ status: 'waiting' });
    });
    socket.on('room_ready', (data: { roomId: string; role: Role }) => {
      setScreen({ status: 'room_ready', role: data.role });
    });
    return () => {
      socket.off('handshake');
      socket.off('waiting');
      socket.off('room_ready');
    };
  }, []);

  let content: React.ReactNode = null;
  if (screen.status === 'disconnected') {
    content = <span>Disconnected</span>;
  } else if (screen.status === 'connected') {
    content = <span>Connected</span>;
  } else if (screen.status === 'waiting') {
    content = <span>Waiting for opponent…</span>;
  } else if (screen.status === 'room_ready') {
    content = <span>Game starting — you're {screen.role}</span>;
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