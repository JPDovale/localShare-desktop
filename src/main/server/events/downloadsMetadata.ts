import { Task } from '@modules/Tasks/Entities/Task';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import stream from 'stream';
import { promisify } from 'util';
import { getTempFolder } from '@config/getTempFolder';
import { connectionReturnsMapper } from '@modules/Mappers/connectionReturnsMapper';
import { getDownloadsFolder } from '@config/getDownloadFolder';
import { ConnectionsGest } from '@modules/Connections/Entities/Connections';
import { EventsListMakerProps } from '../eventsListMaker';

interface DataType {
  chunkSize: number;
  files: {
    canceled: boolean;
    assets: {
      size: number;
      name: string;
      uri: string;
      mimeType: string;
    }[];
  };
}

function createHash512(string: string) {
  const hash = createHash('sha512');
  hash.update(string);
  return hash.digest('hex');
}

export async function downloadsMetadata({
  admConnection,
  connection,
  socket,
}: EventsListMakerProps) {
  const tasks: Task[] = [];

  async function getFilePart(task: Task) {
    const partsLength = task.parts.length;
    const partWithoutData = task.parts.find((part) => !part.completed);

    const response = await socket.emitWithAck('get-file-part', {
      uri: task.fileUri,
      chunkSize: task.chunkSize,
      part: partWithoutData?.ord ?? 0,
    });

    task.fileSize = response.fileSize;

    const hash = createHash512(response.chunk);
    const chunkIsValid = hash === response.validationHash;
    const pathToSaveThisPartData = path.join(getTempFolder(), hash);

    if (partsLength === 0) {
      Array.from({
        length: Math.ceil(task.fileSize / task.chunkSize),
      }).forEach((_, i) => {
        task.parts[i] = {
          completed: !!(i === 0 && chunkIsValid),
          validationHash:
            i === 0 && chunkIsValid ? response.validationHash : '',
          ord: i,
        };
      });
    }

    if (partWithoutData && chunkIsValid) {
      const indexOfPart = task.parts.findIndex(
        (part) => partWithoutData.ord === part.ord,
      );

      task.parts[indexOfPart] = {
        completed: true,
        validationHash: response.validationHash,
        ord: partWithoutData.ord,
      };
    }

    if (chunkIsValid) {
      const chunksCompleted = task.parts.filter(
        (part) => part.completed,
      ).length;

      fs.writeFileSync(pathToSaveThisPartData, response.chunk, 'base64');

      connection.currentTaskProgress =
        ((chunksCompleted * task.chunkSize) / task.fileSize) * 100;

      admConnection.socket.emit(
        'connections',
        ConnectionsGest.connections.map(connectionReturnsMapper),
      );
    }

    const allDownloaded = task.parts.every((part) => part.completed);

    if (!allDownloaded) {
      await getFilePart(task);
    }
  }

  async function concatParts(task: Task) {
    const pipeline = promisify(stream.pipeline);
    const sortedParts = task.parts.sort(
      (previousPart, currentPart) => previousPart.ord - currentPart.ord,
    );
    const finalDestinationPath = path.join(
      getDownloadsFolder(),
      task.fileName.replaceAll(' ', '-'),
    );

    async function reader(
      parts: {
        validationHash: string;
        ord: number;
        completed: boolean;
      }[],
      destinationPath: string,
      index: number = 0,
    ) {
      if (index < parts.length) {
        const part = parts[index];
        const partPath = path.join(getTempFolder(), part.validationHash);

        const readerOf = fs.createReadStream(partPath, 'base64');

        await pipeline(
          readerOf,
          fs.createWriteStream(destinationPath, {
            flags: 'a',
            encoding: 'base64',
          }),
        );

        fs.rmSync(partPath);
        await reader(parts, destinationPath, index + 1);
      }
    }

    await reader(sortedParts, finalDestinationPath);
  }

  async function resolveTask(task: Task) {
    await getFilePart(task);
    task.isFinished = true;
    await concatParts(task);

    connection.pendingTasks -= 1;
    admConnection.socket.emit(
      'connections',
      ConnectionsGest.connections.map(connectionReturnsMapper),
    );

    const nextTaskToResolve = tasks.find((t) => !t.isFinished);

    if (nextTaskToResolve) {
      await resolveTask(nextTaskToResolve);
    }
  }

  return socket.on('downloads-metadata', async (data: DataType) => {
    data.files.assets.forEach((asset) => {
      tasks.push(
        Task.create({
          chunkSize: data.chunkSize,
          fileUri: asset.uri,
          fileSize: 0,
          fileName: asset.name,
          isFinished: false,
          parts: [],
        }),
      );
    });

    connection.pendingTasks = data.files.assets.length;

    admConnection.socket.emit(
      'connections',
      ConnectionsGest.connections.map(connectionReturnsMapper),
    );

    const taskToResolve = tasks.find((t) => !t.isFinished);

    if (taskToResolve) {
      await resolveTask(taskToResolve);
    }

    connection.currentTaskProgress = 0;

    admConnection.socket.emit(
      'connections',
      ConnectionsGest.connections.map(connectionReturnsMapper),
    );
  });
}
