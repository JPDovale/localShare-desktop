import { AggregateRoot } from '@shared/core/Entities/AggregateRoot';
import { UniqueEntityId } from '@shared/core/ValueObjects/UniqueEntityId';
import { Optional } from '@shared/types/optional';
import { Socket } from 'socket.io';

export enum ConnectionStatus {
  CONNECTED = 'connected',
  CONNECTING = 'connecting',
  DISCONNECTED = 'disconnected',
}
export enum ConnectionSr {
  ADM = 'ADM',
  USER = 'USER',
}

interface ConnectionProps {
  status: ConnectionStatus;
  pendingTasks: number;
  currentTaskProgress: number;
  sur: ConnectionSr;
  socket: Socket;
}

export class Connection extends AggregateRoot<ConnectionProps> {
  static create(
    props: Optional<
      ConnectionProps,
      'sur' | 'currentTaskProgress' | 'pendingTasks' | 'status' | 'socket'
    >,
    id?: UniqueEntityId,
  ) {
    const connectionProps: ConnectionProps = {
      sur: ConnectionSr.USER,
      currentTaskProgress: 0,
      pendingTasks: 0,
      status: ConnectionStatus.DISCONNECTED,
      socket: null as unknown as Socket,
      ...props,
    };

    const connection = new Connection(connectionProps, id);

    return connection;
  }

  set status(status: ConnectionStatus) {
    this.PROPS.status = status;
  }

  get status() {
    return this.PROPS.status;
  }

  set socket(socket: Socket) {
    this.PROPS.socket = socket;
  }

  get socket() {
    return this.PROPS.socket;
  }

  get pendingTasks() {
    return this.PROPS.pendingTasks;
  }

  set pendingTasks(pendingTasks: number) {
    this.PROPS.pendingTasks = pendingTasks;
  }

  get currentTaskProgress() {
    return this.PROPS.currentTaskProgress;
  }

  set currentTaskProgress(currentTaskProgress: number) {
    this.PROPS.currentTaskProgress = currentTaskProgress;
  }

  get sur() {
    return this.PROPS.sur;
  }
}
