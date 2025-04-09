/* eslint-disable no-irregular-whitespace */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { contextBridge, ipcRenderer } from 'electron';


contextBridge.exposeInMainWorld('controls', {
    minimize: () => ipcRenderer.invoke('winControls', 'minimize'),
    maximize: () => ipcRenderer.invoke('winControls', 'maximize'),
    close: () => ipcRenderer.invoke('winControls', 'close'),
    size: (arg) => ipcRenderer.invoke('size', arg),
});

contextBridge.exposeInMainWorld('settings', {
    forceRefresh: () => ipcRenderer.invoke('forceRefresh'),

    getBuilder: () => ipcRenderer.invoke('getConfigBuilder'),
    get: (key) => ipcRenderer.invoke('getConfigKey', key),
    set: (key, value) => ipcRenderer.invoke('setConfigKey', key, value),
});

contextBridge.exposeInMainWorld('plugin', {
    pluginList: () => ipcRenderer.invoke('getPluginList'),
    getPluginConfig: (i) => ipcRenderer.invoke('getPluginConfig',i)
});

contextBridge.exposeInMainWorld('callbacks', {
    clientUpdate:(callback) => ipcRenderer.on('clientUpdate',(event,clients) => {
        callback(clients);
    }),
});



contextBridge.exposeInMainWorld('theme', {
    setTheme: (theme) => ipcRenderer.invoke('setTheme', theme),
    getTheme: () => ipcRenderer.invoke('getTheme'),
});






