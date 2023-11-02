import { getDownloadsFolder } from '@config/getDownloadFoldet';
import bonjour from 'bonjour';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import { createServer } from 'http';
import { networkInterfaces } from 'os';
import path from 'path';
import { Server, Socket } from 'socket.io';

const appServer = express();
const server = createServer(appServer);
const bj = bonjour();
const io = new Server(server, {
  cors: { ...cors() },
  connectTimeout: 1000 * 60 * 60 * 24,
});

bj.publish({
  name: 'Local share server',
  port: 3004,
  type: 'http',
});

const interfaces = networkInterfaces();
const ipv4Addresses: string[] = [];

Object.entries(interfaces).forEach(([, interfaceInfo]) => {
  interfaceInfo?.forEach((info) => {
    if (info.family === 'IPv4' && !info.internal) {
      ipv4Addresses.push(info.address);
    }
  });
});

export type Connection = {
  id: string;
  status: 'connected' | 'connecting' | 'disconnected';
  tasks: number;
  currentTaskProgress: number;
};

type SocketTask = {
  socketId: string;
  uri: string;
  isEnd: boolean;
  base64: Array<{ data: string; ord: number }>;
};
let socketsFileUpdating: Array<SocketTask> = [];
let connections: Array<Connection> = [];
let amdSocket: Socket | null = null;

function addConnection(id: string) {
  const connectionExiste = connections.find(
    (connection) => connection.id === id,
  );

  if (connectionExiste && connectionExiste.status === 'connected') {
    return;
  }

  connections = [
    ...connections,
    {
      id,
      status: 'connected',
      currentTaskProgress: 0,
      tasks: 0,
    },
  ];
}

function removeConnection(id: string) {
  connections = connections.filter((connection) => connection.id !== id);
}

function updateConnection(connection: Connection) {
  const indexOfConnectionToUpdate = connections.findIndex(
    (con) => con.id === connection.id,
  );
  connections[indexOfConnectionToUpdate] = connection;
  amdSocket?.emit('connections', connections);
}

io.of('/admin').on('connection', (socket) => {
  console.log('adm logged');
  amdSocket = socket;
  socket.emit('ips', ipv4Addresses);
  socket.emit('connections', connections);
});

io.on('connection', (socket) => {
  console.log(`> user ${socket.id} connected`);

  addConnection(socket.id);

  amdSocket?.emit('connections', connections);

  socket.on('disconnect', () => {
    removeConnection(socket.id);
    amdSocket!.emit('connections', connections);
    console.log(`> user ${socket.id} disconnected`);
  });

  socket.on('file-chunk', (data) => {
    const socketsFileUpdatingTask = socketsFileUpdating.find(
      (socketTask) => socketTask.uri === data.metadata.uri,
    );
    let SocketTask: SocketTask | null = null;

    if (!socketsFileUpdatingTask) {
      const task = {
        socketId: socket.id,
        isEnd: data.end,
        base64: [],
        uri: data.metadata.uri,
      };

      SocketTask = task;
      socketsFileUpdating.push(task);
    } else {
      SocketTask = socketsFileUpdatingTask;
    }

    if (!SocketTask) {
      return;
    }

    SocketTask.base64.push({
      data: data.content,
      ord: data.chunkPart,
    });
    SocketTask.isEnd = data.end;

    updateConnection({
      id: socket.id,
      currentTaskProgress: SocketTask.isEnd
        ? 0
        : (data.metadata.sendingChunk / data.metadata.base64Size) * 100,
      status: 'connected',
      tasks: SocketTask.isEnd ? data.tasks - 1 : data.tasks,
    });

    if (SocketTask.isEnd) {
      const filename = path.basename(data.metadata.uri);

      const fileChunks = SocketTask.base64
        .sort((a, b) => a.ord - b.ord)
        .map((e) => e.data)
        .join('');

      fs.writeFileSync(
        `${getDownloadsFolder()}/${filename}`,
        fileChunks,
        'base64',
      );

      socketsFileUpdating = socketsFileUpdating.filter(
        (socketTask) => socketTask.uri !== SocketTask!.uri,
      );
    }
  });
});

server.listen(3004, () => {
  console.log('server running');
});

export { server };
