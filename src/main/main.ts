import './server';
import { app, ipcMain } from 'electron';
import { Window } from './electron/Window';

const { mainWindow } = Window;

ipcMain.handle('request', () => {
  console.log('ops');
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

app
  .whenReady()
  .then(() => {
    Window.create();
    app.on('activate', () => {
      if (mainWindow === null) Window.create();
    });
  })
  .catch(console.log);
