/* eslint-disable @typescript-eslint/no-explicit-any */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import path from 'path';

import { Mainwindow, store } from './main';
import { webServer } from './restServ';
import { Logger } from './logger';
import { TypedEventEmitterClass } from './utils';

type PluginEvents = {
    playbackChange: [PlayerState],
    mediaChange: [VideoMetadata],
    rawInfoUpdate: [VideoMetadata],
    rawPlayerStateChange: [PlayerState]
}

type LoadedPlugin = {
    plugin: FSPlugin,
    configManager: PluginConfigHelper,
    eventDispatcher: TypedEventEmitterClass<PluginEvents>
}

const logger = new Logger();
export class PluginManager {
    lastSong: string;
    pluginDir: any;
    plugins: FSPlugin[];
    loadedPlugins: LoadedPlugin[];
    constructor(){
        this.pluginDir = path.join(homedir(),'.openMediaShare','plugins');
        if(!existsSync(this.pluginDir)) { mkdirSync(this.pluginDir,{ recursive: true }); }
        this.plugins = [];
        this.loadedPlugins = [];
    }

    async startPlugins(){
        let legacyWarned = false;
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
            this.plugins.push(plugin);
            logger.info(['Plugin Manager'],`Starting Plugin: ${plugin.info.name}`);
            const loadedPlugin:LoadedPlugin = {plugin: plugin,configManager: new PluginConfigHelper(plugin),eventDispatcher: new TypedEventEmitterClass()};

            store.on('infoUpdated',(e) => {
                loadedPlugin.eventDispatcher.emit('rawInfoUpdate',e);
                if (this.lastSong == e.data.title) return;
                loadedPlugin.eventDispatcher.emit('mediaChange',e);
                this.lastSong = e.data.title;
            });

            store.on('playerStateChange',(e) => {
                loadedPlugin.eventDispatcher.emit('rawPlayerStateChange',e);
                if (e == undefined) return;
                loadedPlugin.eventDispatcher.emit('playbackChange',e);
            });



            plugin.start(modules,loadedPlugin.configManager,loadedPlugin.eventDispatcher);
            // check to see if infoupdate exists before calling it
            if (plugin.infoUpdate instanceof Function){
                if (!legacyWarned) {logger.warn(['Plugin Manager'],`Plugin ${plugin.info.name} looks to be using the v0 plugin API. Please ask ${plugin.info.author} to consider switching to the new v1 API.`);}
                legacyWarned = true;
                store.on('infoUpdated',(metadata) => {
                    plugin.infoUpdate(modules,metadata,loadedPlugin.configManager);
                });
            }
            if (plugin.stateUpdate instanceof Function){
                if (!legacyWarned) {logger.warn(['Plugin Manager'],`Plugin ${plugin.info.name} looks to be using the v0 plugin API. Please ask ${plugin.info.author} to consider switching to the new v1 API.`);}
                legacyWarned = true;
                store.on('playerStateChange',(playerState) => {
                    plugin.stateUpdate(modules,playerState,loadedPlugin.configManager);
                });
            }
            logger.info(['Plugin Manager'],`Started Plugin: ${plugin.info.name}`);

            this.loadedPlugins.push(loadedPlugin);
        }
        if (Mainwindow) Mainwindow.webContents.send('allPluginsLoaded',this.loadedPlugins.map(p => p.plugin.info));
    }




    async stopPlugins(){
        // why were we creating a new plugin before calling stop, this wasn't doing anything for the running plugin wtf
        this.loadedPlugins.forEach(lp => {
            logger.info(['Plugin Manager'],`Stopping Plugin: ${lp.plugin.info.name}`);
            lp.eventDispatcher.emitter.removeAllListeners();
            lp.plugin.stop();
            logger.info(['Plugin Manager'],`Stopped Plugin: ${lp.plugin.info.name}`);
            this.loadedPlugins = this.loadedPlugins.filter(_lp => _lp.plugin.info.name !== lp.plugin.info.name);
        });
    }

}

export class PluginConfigHelper {
    name: string;
    filePath: string;
    vaild: boolean;
    configPath: string;
    config: object;
    constructor(plugin: {info: {name: string, configBuilder: configBuilder}},filePath=path.join(homedir(),'.openMediaShare','configs')){
        this.vaild = false;
        this.name = plugin.info.name;
        this.filePath = filePath;
        this.configPath = path.join(this.filePath,`${this.name}.config.json`);
        if (!existsSync(this.filePath)) mkdirSync(this.filePath,{recursive: true});

        if(plugin.info.configBuilder){
            this.buildPluginConfig(plugin);
            this.vaild = true;
        }
        
    }

    private buildPluginConfig(plugin: {info: {name: string, configBuilder: configBuilder}}) {
        
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
        this.config = JSON.parse(readFileSync(this.configPath,'utf-8'));
        //idk do ui stuff sometime
    }

    set(key,value) {
        this.config[key] = value;
        writeFileSync(this.configPath,JSON.stringify(this.config,null,4),);
    }

    get(key) {
        return this.config[key];
    }
}