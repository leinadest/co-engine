import type http from 'http';
import debug from 'debug';

import { PORT } from './environment';

/**
 * Starts the HTTP server and handles any errors that occur during the process.
 *
 * @return {Promise<void>} A Promise that resolves when the server is successfully started.
 */
const startHttpServer = async (httpServer: http.Server): Promise<void> => {
  const onError = (error: any): void => {
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
  };

  const onListening = (): void => {
    const addr = httpServer.address();
    const bind =
      typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
    debug('server:server')(`Listening on ${bind}`);
  };

  httpServer.listen(PORT);
  httpServer.on('error', onError);
  httpServer.on('listening', onListening);
};

export default startHttpServer;
