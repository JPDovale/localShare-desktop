import { BrowserWindow, app, shell } from 'electron';
import path from 'path';
import { resolveHtmlPath } from '../util';
import { AppUpdater } from './AppUpdater';

export class Window {
  static mainWindow: BrowserWindow | null = null;

  protected constructor(window: BrowserWindow) {
    Window.mainWindow = window;

    Window.mainWindow.loadURL(resolveHtmlPath('index.html'));

    Window.mainWindow.on('ready-to-show', () => {
      if (!Window.mainWindow) {
        throw new Error('"mainWindow" is not defined');
      }

      if (process.env.START_MINIMIZED) {
        Window.mainWindow.minimize();
      } else {
        Window.mainWindow.show();
      }
    });

    Window.mainWindow.on('closed', () => {
      Window.mainWindow = null;
    });

    Window.mainWindow.webContents.setWindowOpenHandler((edata) => {
      shell.openExternal(edata.url);
      return { action: 'deny' };
    });

    new AppUpdater();
  }

  static create() {
    const RESOURCES_PATH = app.isPackaged
      ? path.join(process.resourcesPath, 'assets')
      : path.join(__dirname, '../../assets');

    const getAssetPath = (...paths: string[]): string => {
      return path.join(RESOURCES_PATH, ...paths);
    };

    return new Window(
      new BrowserWindow({
        show: false,
        width: 1024,
        height: 728,
        icon: getAssetPath('icon.png'),
        webPreferences: {
          preload: app.isPackaged
            ? path.join(__dirname, 'preload.js')
            : path.join(__dirname, '../../.erb/dll/preload.js'),
        },
      }),
    );
  }
}
