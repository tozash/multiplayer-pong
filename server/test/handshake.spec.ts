import { describe, it, expect } from 'vitest';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { io as ClientIO, Socket } from 'socket.io-client';
import { getFreePort } from './utils/getFreePort';

// Import the server logic
import express from 'express';

function startTestServer(port: number) {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });
  io.on('connection', (socket) => {
    socket.emit('handshake', { ok: true });
  });
  return new Promise<{ httpServer: typeof httpServer; io: Server }>((resolve) => {
    httpServer.listen(port, () => resolve({ httpServer, io }));
  });
}

describe('handshake', () => {
  it('should emit handshake { ok: true } on connect', async () => {
    const port = await getFreePort();
    const { httpServer, io } = await startTestServer(port);
    let client: Socket | null = null;
    try {
      await new Promise<void>((resolve, reject) => {
        client = ClientIO(`http://localhost:${port}`);
        const timeout = setTimeout(() => reject(new Error('Timeout')), 3000);
        client.on('handshake', (data) => {
          try {
            expect(data).toEqual({ ok: true });
            clearTimeout(timeout);
            resolve();
          } catch (err) {
            clearTimeout(timeout);
            reject(err);
          }
        });
        client.on('connect_error', reject);
      });
    } finally {
      client?.disconnect();
      io.close();
      httpServer.close();
    }
  }, 3000);
}); 