/* eslint-disable no-irregular-whitespace */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { contextBridge, ipcRenderer, app} from 'electron';



contextBridge.exposeInMainWorld('controls', {
    minimize: () => ipcRenderer.invoke('winControls', 'minimize'),
    maximize: () => ipcRenderer.invoke('winControls', 'maximize'),
    close: ()    => ipcRenderer.invoke('winControls', 'close'),
    size: (arg)  => ipcRenderer.invoke('size', arg),
});

contextBridge.exposeInMainWorld('settings', {
    
    getAppVersion: () => ipcRenderer.invoke('getAppVersion'),
    forceRefresh: ()  => ipcRenderer.invoke('forceRefresh'),

    getBuilder: ()    => ipcRenderer.invoke('getConfigBuilder'),
    getConfig: ()     => ipcRenderer.invoke('getConfig'),
    get: (key)        => ipcRenderer.invoke('getConfigKey', key),
    set: (key, value) => ipcRenderer.invoke('setConfigKey', key, value),
});

contextBridge.exposeInMainWorld('plugins', {
    getPluginList: ()                             => ipcRenderer.invoke('getPluginList'),
    enable: (pluginName: string)                  => ipcRenderer.invoke('enablePlugin',pluginName),
    disable: (pluginName: string)                 => ipcRenderer.invoke('disablePlugin',pluginName),
    getConfig: (pluginName: string)               => ipcRenderer.invoke('getPluginConfig',pluginName),
    get: (pluginName: string, key: string)        => ipcRenderer.invoke('getPluginKey',pluginName,key),
    set: (pluginName: string, key: string, value) => ipcRenderer.invoke('setPluginKey',pluginName,key,value)
});

contextBridge.exposeInMainWorld('callbacks', {
    clientUpdate:(callback) => ipcRenderer.on('clientUpdate',(event,clients) => {
        callback(clients);
    }),
});



contextBridge.exposeInMainWorld('theme', {
    setTheme: (theme) => ipcRenderer.invoke('setTheme', theme),
    getTheme: ()      => ipcRenderer.invoke('getTheme'),
});






