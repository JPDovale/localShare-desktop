import {
  Connection,
  ConnectionSr,
  ConnectionStatus,
} from '@modules/Connections/Entities/Connection';
import { Server } from '@modules/Servers/Entities/Server';
import { app } from 'electron';
import { ConnectionsGest } from '@modules/Connections/Entities/Connections';
import { eventsListMaker } from './eventsListMaker';

export type ConnectionReturns = {
  id: string;
  status: 'connected' | 'connecting' | 'disconnected';
  pendingTasks: number;
  currentTaskProgress: number;
};

function connectionReturnsMapper(connection: Connection): ConnectionReturns {
  return {
    currentTaskProgress: connection.currentTaskProgress,
    pendingTasks: connection.pendingTasks,
    id: connection.id.toString(),
    status: connection.status,
  };
}

async function main() {
  const server = await Server.waitForServer();
  const admConnection = Connection.create({
    sur: ConnectionSr.ADM,
    status: ConnectionStatus.CONNECTING,
  });
  // eslint-disable-next-line prefer-const

  server.ioConnection.of('/admin').on('connection', (socket) => {
    admConnection.status = ConnectionStatus.CONNECTED;
    admConnection.socket = socket;

    console.log('>> ADM LOGGED IN <<');

    socket.emit('codes', [server.connectionId]);
    socket.emit('connections', ConnectionsGest.connections);
  });

  server.ioConnection.on('connection', (socket) => {
    const connection = Connection.create({
      status: ConnectionStatus.CONNECTED,
      socket,
    });
    ConnectionsGest.connections.push(connection);

    admConnection.socket.emit(
      'connections',
      ConnectionsGest.connections.map(connectionReturnsMapper),
    );

    console.log(`>> ${connection.sur} CONNECTED WITH ID ${socket.id}`);

    eventsListMaker({ socket, admConnection, connection });
  });

  app.on('window-all-closed', () => {
    server.serverHttp.closeAllConnections();
    server.serverHttp.close();

    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

main();
