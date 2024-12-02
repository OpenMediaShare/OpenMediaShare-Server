import { app, BrowserWindow, Menu, nativeImage, Tray, dialog, MessageBoxOptions } from 'electron';
import path = require('path');

export const closedialogSettings:MessageBoxOptions = {
    buttons: ['Hide To Tray', 'Exit Program'],
    message: 'Do you want to exit the program, or hide it to the tray?',
    title: 'Exit Program?',
    type: 'question',
};


export function createBasicTray(
    tray: Tray,
    window: { show: () => void },
): void {
    const icon = path.join(__dirname, '../app/ytlogo4.png'); // required.
    const trayicon = nativeImage.createFromPath(icon);
    tray = new Tray(trayicon.resize({ width: 16 }));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                window.show();
            },
        },
        {
            label: 'Quit',
            click: () => {
                app.quit();
            },
        },
    ]);
    tray.setContextMenu(contextMenu);
}