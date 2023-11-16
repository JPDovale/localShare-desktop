import { ConnectionStatus } from '@modules/Connections/Entities/Connection';
import { connectionReturnsMapper } from '@modules/Mappers/connectionReturnsMapper';
import { ConnectionsGest } from '@modules/Connections/Entities/Connections';
import { EventsListMakerProps } from '../eventsListMaker';

export function closeConnection({
  admConnection,
  connection,
}: EventsListMakerProps) {
  return admConnection.socket.on('close-connection', (data) => {
    const indexOfConnectionToClose = ConnectionsGest.connections.findIndex(
      (conn) => conn.id.toString() === data.id,
    );

    ConnectionsGest.connections[indexOfConnectionToClose].status =
      ConnectionStatus.DISCONNECTED;
    ConnectionsGest.connections[
      indexOfConnectionToClose
    ].currentTaskProgress = 0;
    ConnectionsGest.connections[indexOfConnectionToClose].pendingTasks = 0;
    ConnectionsGest.connections[indexOfConnectionToClose].socket.disconnect();

    admConnection.socket.emit(
      'connections',
      ConnectionsGest.connections.map(connectionReturnsMapper),
    );

    setTimeout(
      () => {
        ConnectionsGest.connections = ConnectionsGest.connections.filter(
          (con) => con.id.toString() !== data.id,
        );
        admConnection.socket.emit(
          'connections',
          ConnectionsGest.connections.map(connectionReturnsMapper),
        );
      },
      1000 * 30, // 30seg
    );

    console.log(
      `>> ${connection.sur} WITH ID ${connection.socket.id} DISCONNECTED BY ADM`,
    );
  });
}
