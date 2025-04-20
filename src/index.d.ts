export { };
import 'oms-sharedtypes';
declare global {
    interface Window {
        settings: {
            forceRefresh: () => void,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            get: (key) => Promise<any>,
            set: (key,value) => void
            getBuilder: () => Promise<PluginInfo['configBuilder']>
        }
        plugins: {
            getPluginList: () => Promise<{all: PluginInfo[], loaded: PluginInfo[]}>,
            getPluginConfig: (index) => Promise<PluginInfo['configBuilder']>
            enable: (pluginName: string) => void
            disable: (pluginName: string) => void
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

    interface configBuilder {
        pages: Record<string, {
            id: string,
            displayName: string,
            type: 'checkbox' | 'text' | 'number', //add options here
            required: boolean,
            default?: string | boolean | number,
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
        configBuilder: configBuilder,
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


