export { };
import 'oms-sharedtypes';
declare global {
    interface Window {
        settings: {
            forceRefresh: () => void,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            get: (key) => Promise<any>,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            getConfig: () => Promise<any>,
            set: (key,value) => void,
            getBuilder: () => Promise<PluginInfo['configBuilder']>
        }
        plugins: {
            getPluginList: () => Promise<{all: PluginInfo[], loaded: PluginInfo[]}>,
            getConfig: (pluginName: string) => Promise<PluginInfo['configBuilder']>,
            enable: (pluginName: string) => void,
            disable: (pluginName: string) => void,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            get: (pluginName: string, key: string) => Promise<any>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            set: (pluginName: string, key: string, value) => Promise<any>
        }
        callbacks: {
            clientUpdate: (callback: (clients: Client[]) => void) => void
        }
    }

    enum WinControls {
        minimize,
        maximize,
        close,
    }

    interface ConfigBuilder {
        pages: Record<string, {
            id: string,
            displayName: string,
            type: 'checkbox' | 'text' | 'number' | 'range' | 'dropdown' | 'color', //add options here
            required: boolean,
            default?: string | boolean | number,
            // This is REQUIRED if your using range
            min?: number,
            // This is REQUIRED if your using range
            max?: number,
            // This is REQUIRED if your using range
            step?: number
            dropdownEntries?: string[],
            // Only works for text inputs
            sensitive?: boolean
        }[]>
    }


    interface pluginConfigHelper {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        get: (key: string) => any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set: (key: string, value: any) => void,
    }

    interface PluginModules { electron, infoStore, express }

    interface PluginInfo {
        name: string,
        author: string,
        configBuilder: ConfigBuilder,
        version?: string,
        description?: string
        isRunning: boolean
        legacy?: boolean
    }

    interface FSPlugin {
        start: (PluginModules, pluginConfigHelper, TypedEventEmitter) => void,
        stop: () => void,
        infoUpdate: (PluginModules, VideoMetadata, pluginConfigHelper) => void,
        stateUpdate: (PluginModules, PlayerState, pluginConfigHelper) => void
        info: PluginInfo
    }


    

}


