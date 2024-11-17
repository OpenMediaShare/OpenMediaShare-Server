export { };
import 'oms-sharedtypes';
declare global {
    interface Window {
        theme: {
            setTheme: (string) => void,
            getTheme: () => void,
        },
        settings: {
            forceRefresh: () => void,
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
    interface FSPlugin {
        start: (PluginModules, pluginConfigHelper) => void,
        stop: () => void,
        infoUpdate: (PluginModules, VideoMetadata, pluginConfigHelper) => void,
        stateUpdate: (PluginModules, PlayerState, pluginConfigHelper) => void
        info: {
            name: string,
            auther: string,
            configBuilder: configBuilder,
        }
    }
}


