import type http from 'http';

import { PORT } from './environment';

/**
 * Starts the HTTP server and handles any errors that occur during the process.
 *
 * @return {Promise<void>} A Promise that resolves when the server is successfully started.
 */
const startHttpServer = (httpServer: http.Server): void => {
  httpServer.on('error', (error: any) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind =
      typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT as string}`;

    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });

  httpServer.listen({ host: '0.0.0.0', port: PORT }, (): void => {
    const addr = httpServer.address();
    const bind =
      typeof addr === 'string'
        ? `pipe ${addr}`
        : `${addr?.address}:${addr?.port}`;
    console.log(`Listening on ${bind}`);
  });
};

export default startHttpServer;
