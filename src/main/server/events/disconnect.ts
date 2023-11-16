import { ConnectionStatus } from '@modules/Connections/Entities/Connection';
import { connectionReturnsMapper } from '@modules/Mappers/connectionReturnsMapper';
import { ConnectionsGest } from '@modules/Connections/Entities/Connections';
import { EventsListMakerProps } from '../eventsListMaker';

export function disconnect({
  admConnection,
  connection,
  socket,
}: EventsListMakerProps) {
  return socket.on('disconnect', () => {
    connection.status = ConnectionStatus.DISCONNECTED;
    admConnection.socket.emit(
      'connections',
      ConnectionsGest.connections.map(connectionReturnsMapper),
    );

    setTimeout(
      () => {
        ConnectionsGest.connections = ConnectionsGest.connections.filter(
          (con) => !con.equals(connection),
        );
        admConnection.socket.emit(
          'connections',
          ConnectionsGest.connections.map(connectionReturnsMapper),
        );
      },
      1000 * 30, // 30seg
    );

    console.log(`>> ${connection.sur} WITH ID ${socket.id} DISCONNECTED`);
  });
}
