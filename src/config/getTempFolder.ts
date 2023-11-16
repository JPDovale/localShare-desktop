import path from 'path';
import fs from 'fs';
import os from 'os';
import { app } from 'electron';

export function getTempFolder() {
  const localSharerTempFolder = app.isPackaged
    ? path.join(__dirname, 'temp')
    : path.join(os.homedir(), 'smartShare', 'temp');

  if (!fs.existsSync(localSharerTempFolder)) {
    fs.mkdirSync(localSharerTempFolder, { recursive: true });
  }

  return localSharerTempFolder;
}
