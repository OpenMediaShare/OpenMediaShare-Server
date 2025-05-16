/* eslint-disable @typescript-eslint/no-explicit-any */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import path from 'path';

import { store } from './main';
import { webServer } from './restServ';
import { Logger } from './logger';

const logger = new Logger();
export class PluginManager {
    pluginDir: any;
    plugins: FSPlugin[];
    constructor(){
        this.pluginDir = path.join(homedir(),'.openMediaShare','plugins');
        if(!existsSync(this.pluginDir)) { mkdirSync(this.pluginDir,{ recursive: true }); }
        this.plugins = [];
    }

    async startPlugins(){
        let consoleLogDetect = true;
        const files = readdirSync(this.pluginDir,{ withFileTypes: true });
        const electronImport = await import('electron');
        const modules = {
            electron: electronImport,
            infoStore: store,
            express: webServer
        };
        for(const file of files) {
            if (!file.isFile() || !file.name.endsWith('js')) continue;
            logger.info(['Plugin Manager'],`Importing Plugin: ${file.name}`);
            const plugin: FSPlugin = await import(path.join(this.pluginDir,file.name)); 
            logger.info(['Plugin Manager'],`Starting Plugin: ${plugin.info.name}`);
            const oldLog = console.log;
            console.log = (e) => {
                if (consoleLogDetect) {
                    oldLog(`This plugin is using console.log, Please ask ${plugin.info.auther} to consider switching to the plugin logger instead.`);
                }
                consoleLogDetect = false;
                console.log = oldLog;
                logger.info(['Legacy Plugin',plugin.info.name],e);
                // oldLog(e);
            };
            const pluginConfigHelper = new PluginConfigHelper(plugin);
            plugin.start(modules,pluginConfigHelper);
            this.plugins.push(plugin);
            if (file.name.endsWith('js.d')){
                logger.info(['Plugin Manager'],`Plugin "${file.name}" is disabled`);
                continue;
            }
            await this.startPlugin(plugin.info.name);

        }
        if (Mainwindow) Mainwindow.webContents.send('allPluginsLoaded',this.runningPlugins.map(p => p.plugin.info));
    }


    private async startPlugin(pluginName: string){
        const electronImport = await import('electron');
        // [WaterWolf5918] Recreating this between plugins should help prevent plugins being able to modify builtin functions.
        const modules = {
            electron: electronImport,
            express: webServer,
            Logger: Logger,
            /**
             * @deprecated Since 1.1.0 will be removed 2.0
             */
            infoStore: store
        };

        const plugin = this.plugins.find(p => p.info.name == pluginName);
        const runningPlugin:RunningPlugin = {plugin: plugin,configManager: new PluginConfigHelper(plugin),eventDispatcher: new TypedEventEmitterClass()};

        plugin.info.legacy = false;

        logger.info(['Plugin Manager'],`Starting Plugin: ${plugin.info.name}`); 
        store.on('infoUpdated',(e) => {
            runningPlugin.eventDispatcher.emit('rawInfoUpdate',e);
            
            if (this.lastSong == e.data.title) return;
            runningPlugin.eventDispatcher.emit('mediaChange',e);
            this.lastSong = e.data.title;
        });

        store.on('playerStateChange',(e) => {
            runningPlugin.eventDispatcher.emit('rawPlayerStateChange',e);
            if (e == undefined) return;
            runningPlugin.eventDispatcher.emit('playbackChange',e);
        });



        plugin.start(modules,runningPlugin.configManager,runningPlugin.eventDispatcher);
        // check to see if infoupdate exists before calling it
        if (plugin.infoUpdate instanceof Function){
            if (!plugin.info.legacy) {logger.warn(['Plugin Manager'],`Plugin ${plugin.info.name} looks to be using the v0 plugin API. Please ask ${plugin.info.author} to consider switching to the new v1 API.`);}

            plugin.info.legacy = true;
            store.on('infoUpdated',(metadata) => {
                plugin.infoUpdate(modules,metadata,runningPlugin.configManager);
            });
        }
        if (plugin.stateUpdate instanceof Function){
            if (!plugin.info.legacy) {logger.warn(['Plugin Manager'],`Plugin ${plugin.info.name} looks to be using the v0 plugin API. Please ask ${plugin.info.author} to consider switching to the new v1 API.`);}

            plugin.info.legacy = true;
            store.on('playerStateChange',(playerState) => {
                plugin.stateUpdate(modules,playerState,runningPlugin.configManager);
            });
        }
        logger.info(['Plugin Manager'],`Started Plugin: ${plugin.info.name}`);

        this.runningPlugins.push(runningPlugin);
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


