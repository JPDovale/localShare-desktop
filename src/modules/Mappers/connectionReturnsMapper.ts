import { Connection } from '@modules/Connections/Entities/Connection';
import { ConnectionReturns } from 'src/main/server';

export function connectionReturnsMapper(
  connection: Connection,
): ConnectionReturns {
  return {
    currentTaskProgress: connection.currentTaskProgress,
    pendingTasks: connection.pendingTasks,
    id: connection.id.toString(),
    status: connection.status,
  };
}
