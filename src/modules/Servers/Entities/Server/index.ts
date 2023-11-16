import express from 'express';
import ngrok from 'ngrok';
import cors from 'cors';
import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { createServer, Server as ServerHTTP } from 'http';
import { Server as ServerSocket } from 'socket.io';

interface ServerProps {
  url: string;
  connectionId: string;
  appServer: express.Express;
  serverHttp: ServerHTTP;
  ioConnection: ServerSocket;
}

export class Server extends AggregateRoot<ServerProps> {
  static async create() {
    const { appServer, ioConnection, ngrokConnection, serverHttp } =
      await this.bootstrap();

    const serverProps: ServerProps = {
      appServer,
      serverHttp,
      url: ngrokConnection,
      ioConnection,
      connectionId: ngrokConnection.split('//')[1].split('.')[0],
    };

    const server = new Server(serverProps);

    return server;
  }

  static async bootstrap() {
    const appServer = express();
    const serverHttp = createServer(appServer);
    const ioConnection = new ServerSocket(serverHttp, {
      cors: { ...cors() },
      connectTimeout: 1000 * 60 * 60 * 24,
    });

    const ngrokConnection = await ngrok.connect({
      proto: 'http',
      addr: 3004,
      region: 'sa',
      binPath: (p) => p.replace('app.asar', 'app.asar.unpacked'),
    });

    return { appServer, serverHttp, ioConnection, ngrokConnection };
  }

  static async waitForServer() {
    const server: Server = await Server.create();

    server.serverHttp.listen(3004, () => {
      console.log('Server running');
    });

    return server;
  }

  get connectionId() {
    return this.PROPS.connectionId;
  }

  get serverHttp() {
    return this.PROPS.serverHttp;
  }

  get ioConnection() {
    return this.PROPS.ioConnection;
  }

  get url() {
    return this.PROPS.url;
  }
}
