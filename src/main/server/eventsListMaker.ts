import { Connection } from '@modules/Connections/Entities/Connection';
import { Socket } from 'socket.io';
import { disconnect } from './events/disconnect';
import { downloadsMetadata } from './events/downloadsMetadata';
import { closeConnection } from './events/closeConnection';

export interface EventsListMakerProps {
  socket: Socket;
  admConnection: Connection;
  connection: Connection;
}

export function eventsListMaker(props: EventsListMakerProps) {
  return [disconnect(props), downloadsMetadata(props), closeConnection(props)];
}
