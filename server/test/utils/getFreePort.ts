import { createServer } from 'net';

export function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.listen(0, () => {
      const address = srv.address();
      if (typeof address === 'object' && address && 'port' in address) {
        const port = address.port;
        srv.close(() => resolve(port));
      } else {
        srv.close(() => reject(new Error('Could not get free port')));
      }
    });
    srv.on('error', reject);
  });
} 