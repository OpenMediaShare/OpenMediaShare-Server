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

contextBridge.exposeInMainWorld('plugins', {
    getPluginList: () => ipcRenderer.invoke('getPluginList'),
    getPluginConfig: (i) => ipcRenderer.invoke('getPluginConfig',i),
    enable: (pluginName: string) => ipcRenderer.invoke('enablePlugin',pluginName),
    disable: (pluginName: string) => ipcRenderer.invoke('disablePlugin',pluginName),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: (pluginName: string, key: string) => ipcRenderer.invoke('getPluginKey',pluginName,key),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set: (pluginName: string, key: string, value) => ipcRenderer.invoke('setPluginKey',pluginName,key,value)
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






