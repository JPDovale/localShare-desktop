import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'request';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: any[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: any[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: any[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: any[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke(channel: Channels, ...args: any[]) {
      return ipcRenderer.invoke(channel, ...args);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
