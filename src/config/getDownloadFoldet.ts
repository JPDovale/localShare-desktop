import path from 'path';
import os from 'os';
import fs from 'fs';

export function getDownloadsFolder() {
  const localSharerFolder = path.join(os.homedir(), 'Downloads', 'localSharer');

  if (!fs.existsSync(localSharerFolder)) {
    fs.mkdirSync(localSharerFolder, { recursive: true });
  }

  return localSharerFolder;
}
