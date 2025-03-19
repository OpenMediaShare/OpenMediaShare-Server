/* eslint-disable @typescript-eslint/no-explicit-any */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import path from 'path';

import { store } from './main';
import { webServer } from './restServ';
import { Logger } from './logger';
import { TypedEventEmitterClass } from './utils';

type PluginEvents = {
    playbackChange: [PlayerState],
    mediaChange: [VideoMetadata],
    rawInfoUpdate: [VideoMetadata]
    rawPlayerStateChange: [PlayerState]
}


const logger = new Logger();
export class PluginManager {
    lastSong: string;
    pluginDir: any;
    plugins: FSPlugin[];
    constructor(){
        this.pluginDir = path.join(homedir(),'.openMediaShare','plugins');
        if(!existsSync(this.pluginDir)) { mkdirSync(this.pluginDir,{ recursive: true }); }
        this.plugins = [];
    }

    async startPlugins(){
        // let consoleLogDetect = true;
        const files = readdirSync(this.pluginDir,{ withFileTypes: true });
        const electronImport = await import('electron');
        const modules = {
            electron: electronImport,
            express: webServer,
            Logger: Logger
        };
        for(const file of files) {
            if (!file.isFile() || !file.name.endsWith('js')) continue;
            logger.info(['Plugin Manager'],`Importing Plugin: ${file.name}`);
            const plugin: FSPlugin = await import(path.join(this.pluginDir,file.name)); 

            if (!plugin.info || !plugin.info.name) {
                logger.warn(['Plugin Manager'],`File ${file.name} isn't a vaild plugin, Skipping. `);
                return;
            }
            // Fix for my bad spelling, i'm sorry :(
            // @ts-expect-error This is a missing type because it doesn't exist in any new projects, and is from my miss spelling.
            if (plugin.info.auther) {
                // @ts-expect-error This is a missing type because it doesn't exist in any new projects, and is from my miss spelling.
                plugin.info.author = plugin.info.auther;
            }

            logger.info(['Plugin Manager'],`Starting Plugin: ${plugin.info.name}`);
            const oldLog = console.log;

            const pluginConfigHelper = new PluginConfigHelper(plugin);
            const pluginEventDispatcher: TypedEventEmitterClass<PluginEvents> = new TypedEventEmitterClass();

            store.on('infoUpdated',(e) => {
                pluginEventDispatcher.emit('rawInfoUpdate',e);
                if (this.lastSong == e.data.title) return;
                pluginEventDispatcher.emit('mediaChange',e);
                this.lastSong = e.data.title;
            });

            store.on('playerStateChange',(e) => {
                pluginEventDispatcher.emit('rawPlayerStateChange',e);
                if (e == undefined) return;
                pluginEventDispatcher.emit('playbackChange',e);
            });



            plugin.start(modules,pluginConfigHelper,pluginEventDispatcher);
            // console.log = oldLog;
            this.plugins.push(plugin);

            // check to see if infoupdate exists before calling it
            if (plugin.infoUpdate instanceof Function){
                logger.warn(['Plugin Manager'],`Plugin ${plugin.info.name} looks to be using the v0 plugin API. Please ask ${plugin.info.author} to consider switching to the new v1 API.`);
                store.on('infoUpdated',(metadata) => {
                    plugin.infoUpdate(modules,metadata,pluginConfigHelper);
                });
            }
            if (plugin.stateUpdate instanceof Function){
                logger.warn(['Plugin Manager'],`Plugin ${plugin.info.name} looks to be using the v0 plugin API. Please ask ${plugin.info.author} to consider switching to the new v1 API.`);
                store.on('playerStateChange',(playerState) => {
                    plugin.stateUpdate(modules,playerState,pluginConfigHelper);
                });
            }
            logger.info(['Plugin Manager'],`Started Plugin: ${plugin.info.name}`);
        }
    }




    async stopPlugins(){
        // const files = readdirSync(this.pluginDir,{ withFileTypes: true });
        // for(const file of files) {
        //     if (!file.isFile() || !file.name.endsWith('js')) return;
        //     console.log(`Starting Plugin: ${file.name}`);
        //     const plugin = await import(path.join(this.pluginDir,file.name));
        //     plugin.stop();
        //     console.log(`Started Plugin: ${plugin.info.name}`);
        // }

        // why were we creating a new plugin before calling stop, this wasn't doing anything for the running plugin wtf
        this.plugins.forEach(plugin => {
            logger.info(['Plugin Manager'],`Stopping Plugin: ${plugin.info.name}`);
            plugin.stop();
            logger.info(['Plugin Manager'],`Stopped Plugin: ${plugin.info.name}`);

        });
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


