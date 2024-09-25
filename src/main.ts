if (require('electron-squirrel-startup')) process.exit();
import path from 'path';
import * as positron from './positron';
import { app, BrowserWindow, dialog, ipcMain, Tray } from 'electron';
import { ConfigHelper } from './utils';
import { InfoStore } from './infoStore';
import { restSetup } from './restServ';
import { networkInterfaces } from 'os';
import { PluginManager } from './pluginManager';
import { AuthManager } from './ClientManager';
export const store = new InfoStore();
export const configStore = new ConfigHelper(path.join(__dirname, '../config.json'));
const pluginManager = new PluginManager();
export const authManager = new AuthManager();

export let Mainwindow: BrowserWindow;
let Settingswindow;
let WindowCloseState = false;
const tray: Tray = null;


console.clear = () => {
    console.log('\x1b[2J\x1b[H\x1bc');
}; //since console.clear() still doesn't work on windows :face_palm:




function createWindow() {
    Mainwindow = new BrowserWindow({
        // width: 425,
        // height: 280,
        resizable: true,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        frame: true,
        icon: path.join(__dirname, '../build', 'YTlogo4.png'),

    });
    Mainwindow.loadFile(path.join(__dirname, '../app/index.html'));
    if (!tray) { positron.createBasicTray(tray, Mainwindow); }
    Mainwindow.webContents.once('dom-ready', () => {
        Mainwindow.setBackgroundColor('#000000ff');
        Mainwindow.setBackgroundMaterial('acrylic');
    });

    Mainwindow.on('close', (e) => {
        WindowCloseState ? console.log() : e.preventDefault();
        dialog.showMessageBox(positron.closedialogSettings).then(async (result) => {
            if (result.response) {
                WindowCloseState = true;
                await pluginManager.stopPlugins();
                app.quit();
            } else {
                BrowserWindow.getFocusedWindow().hide();
            }
        });
    });
}

function createWindow2() {
    Settingswindow = new BrowserWindow({
        width: 600,
        height: 600,
        resizable: true,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        frame: true,
        backgroundMaterial: 'tabbed',
        autoHideMenuBar: true,
        transparent: true
    });
    Settingswindow.loadFile(path.join(__dirname, '../app/settings.html'));
    Settingswindow.setBackgroundMaterial('tabbed');
}

ipcMain.handle('setTheme', (_event, arg) => {
    configStore.set('theme', arg);
});

ipcMain.handle('getTheme', () => {
    return configStore.get('theme');
});


ipcMain.handle('winControls', (_event, arg) => {
    positron.handleWinControls(arg);
});


ipcMain.handle('settings', () => {
    console.log(configStore.getFull());
    console.log('[ipcMain] [settings] > settings');
    createWindow2();
});

ipcMain.handle('setOptions', (_event, args) => {
    if (configStore.get('mode') !== args.service) {
        store.blank();
    }
    configStore.set('mode', args.service);
    configStore.set('showTTY', args.showTTy);
    configStore.set('errNote', args.errNote);
    configStore.set('RPCServer', args.RPCServer);
});

ipcMain.handle('getOptions', () => {
    return configStore.getFull();
});

ipcMain.handle('forceRefresh', () => {
    Mainwindow.reload();
});


app.whenReady().then(() => {
    createWindow();
    store.on('infoUpdated', () => {
        console.log('[InfoStore] [Debug] Info Update');
        Mainwindow.webContents.send('infoUpdate', store.info);
    });
    console.log('Starting Plugins');
    pluginManager.startPlugins();
});


restSetup()
    .then(() => {
        console.log('[restServ] Server listening on port 9494');
        const interfaces = networkInterfaces();
        Object.entries(interfaces).forEach(item => {
            item[1].forEach(info => {
                console.log(`    ${item[0]}: \x1b[36mhttp://${info.address}:9494\x1b[0m`);
            });
        });

    })
    .catch(err => {
        console.error(err);
        throw new Error('Failed to create web server');
    });



