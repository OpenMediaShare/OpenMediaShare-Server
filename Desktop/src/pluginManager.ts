/* eslint-disable @typescript-eslint/no-explicit-any */
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { homedir } from 'os';
import path from 'path';

import { store } from './main';
import { webServer } from './restServ';


export class PluginManager {
    pluginDir: any;
    constructor(){
        this.pluginDir = path.join(homedir(),'.openMediaShare','plugins');
        if(!existsSync(this.pluginDir)) { mkdirSync(this.pluginDir,{ recursive: true }); }
    }

    async startPlugins(){
        const files = readdirSync(this.pluginDir,{ withFileTypes: true });
        const electronImport = await import('electron');
        const modules = {
            electron: electronImport,
            infoStore: store,
            express: webServer
        };
        for(const file of files) {
            if (!file.isFile() || !file.name.endsWith('js')) return;
            console.log(`Starting Plugin: ${file.name}`);
            const plugin = await import(path.join(this.pluginDir,file.name));
            plugin.start(modules);
            store.on('infoUpdated',(metadata) => {
                plugin.infoUpdate(modules,metadata);
            });
            console.log(`Started Plugin: ${plugin.info.name}`);
        }
    }

    async stopPlugins(){
        const files = readdirSync(this.pluginDir,{ withFileTypes: true });
        for(const file of files) {
            if (!file.isFile() || !file.name.endsWith('js')) return;
            console.log(`Starting Plugin: ${file.name}`);
            const plugin = await import(path.join(this.pluginDir,file.name));
            plugin.stop();
            console.log(`Started Plugin: ${plugin.info.name}`);
        }
    }

}