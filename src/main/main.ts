import { app, ipcMain } from 'electron';
import { server } from './server';
import { Window } from './electron/Window';

const { mainWindow } = Window;

ipcMain.handle('request', () => {
  console.log('ops');
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

app.on('window-all-closed', () => {
  server.closeAllConnections();
  server.close();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    Window.create();
    app.on('activate', () => {
      if (mainWindow === null) Window.create();
    });
  })
  .catch(console.log);
