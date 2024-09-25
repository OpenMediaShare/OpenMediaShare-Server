/* eslint-disable @typescript-eslint/no-explicit-any */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
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
            console.log(`Importing Plugin: ${file.name}`);
            const plugin: FSPlugin = await import(path.join(this.pluginDir,file.name)); 
            console.log(`Starting Plugin: ${file.name}`);
            const pluginConfigHelper = new PluginConfigHelper(plugin);
            plugin.start(modules,pluginConfigHelper);
            //check to see if infoupdate exists before calling it
            if (plugin.infoUpdate instanceof Function){
                store.on('infoUpdated',(metadata) => {
                    plugin.infoUpdate(modules,metadata,pluginConfigHelper);
                });
            }
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

class PluginConfigHelper {
    name: string;
    path: string;
    vaild: boolean;
    configPath: string;
    constructor(plugin: FSPlugin){
        this.vaild = false;
        this.name = plugin.info.name;
        this.path = path.join(homedir(),'.openMediaShare','configs');
        this.configPath = path.join(this.path,`${this.name}.config.json`);
        if (!existsSync(this.path)) mkdirSync(this.path,{recursive: true});

        if(plugin.info.configBuilder){
            this.buildPluginConfig(plugin);
            this.vaild = true;
        }
        
    }

    private buildPluginConfig(plugin: FSPlugin) {
        
        if(!existsSync(this.configPath)){
            const json = {};
            const pages = plugin.info.configBuilder.pages;

            // const testPages = testPlugin.info.configBuilder.pages;
            //# condense pages into one key:value pairs 
            //## loop over each page
            Object.keys(pages).forEach(page => {
                //## loop over elements in the array and turn it into a key:value
                pages[page].forEach(e => json[e.id] = e.default?? null);
            });
            writeFileSync(this.configPath,JSON.stringify(json,null,4),);
        }
        //idk do ui stuff sometime
    }

    set(key,value) {
        const json = JSON.parse(readFileSync(this.configPath,'utf-8'));
        json[key] = value;
        writeFileSync(this.configPath,JSON.stringify(json,null,4),);
    }

    get(key) {
        const json = JSON.parse(readFileSync(this.configPath,'utf-8'));
        return json[key];
    }
}


