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
import { Logger } from './logger';
export const store = new InfoStore();
export const configStore = new ConfigHelper(path.join(__dirname, '../config.json'));
export const authManager = new AuthManager();

const pluginManager = new PluginManager();
const tray: Tray = null;
const logger = new Logger();

export let Mainwindow: BrowserWindow;
let WindowCloseState = false;



console.clear = () => {
    console.log('\x1b[2J\x1b[H\x1bc');
}; //since console.clear() still doesn't work on windows :face_palm:


function createWindow() {
    Mainwindow = new BrowserWindow({
        resizable: true,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        frame: true,
        autoHideMenuBar: true,
        backgroundMaterial: 'acrylic',
        // transparent: true,
        icon: path.join(__dirname, '../build', 'YTlogo4.png'),

    });
    Mainwindow.loadFile(path.join(__dirname, '../app/index.html'));
    if (!tray) { positron.createBasicTray(tray, Mainwindow); }

    Mainwindow.on('close', (e) => {
        WindowCloseState ? console.log() : e.preventDefault();
        dialog.showMessageBox(positron.closedialogSettings).then(async (result) => {
            // logger.derror([''],result.checkboxChecked.toString());
            if (result.response) {
                WindowCloseState = true;
                logger.info(['Main'],'Shutting Down...');
                await pluginManager.stopPlugins();
                app.quit();
            } else {
                BrowserWindow.getFocusedWindow().hide();
            }
        });
    });
}




ipcMain.handle('forceRefresh', () => {
    Mainwindow.reload();
});

ipcMain.handle('getConfigKey',(_event, key) => {
    return configStore.get(key);
});

ipcMain.handle('setConfigKey',(_event, key,value) => {
    logger.info(['Main','Settings'],`Set Option "${key}" to "${value}"`);
    return configStore.set(key,value);
});


app.whenReady().then(() => {
    createWindow();
    store.on('infoUpdated', () => {
        logger.dinfo(['InfoStore'],'Info Update');
        Mainwindow.webContents.send('infoUpdate', store.info);
    });
    logger.info(['Plugin Manager'],'Starting Plugins');
    pluginManager.startPlugins();

});


restSetup()
    .then(() => {
        logger.info(['restServ'],'Server listening on port 9494');
        const interfaces = networkInterfaces();
        Object.entries(interfaces).forEach(item => {
            item[1].forEach(info => {
                console.log(`    ${item[0]}: \x1b[36mhttp://${info.address}:9494\x1b[0m`);
            });
        });

    })
    .catch(err => {
        console.error(err);
        process.exit();
        throw new Error('Failed to create web server');
        
    });



