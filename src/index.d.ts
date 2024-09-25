export { };

declare global {
    interface Window {
        theme: {
            setTheme: (string) => void;
            getTheme: () => void;
        },
        settings: {
            forceRefresh: () => void;
        }
    }

    interface clientAuth {
        name: string;
        uuid: string;
        service: string;
    }

    interface VideoMetadata {
        video: {
            creator: string;
            title: string;
            views?: string;
            likes?: string;
            thumbnail: string;
            url: string;
            color?: object
        };
        time: {
            curruntTime: number;
            totalTime: number;
            timePercent: number;
            formattedTime: string;
        };
        auth: clientAuth;
    }

    interface Client extends clientAuth {

        ip: string
        clientInfo?: {
            thumbnail: string;
            creator: string;
            title: string;
            playerState: 'playing' | 'paused' | 'fucked';
        }
    }

    enum WinControls {
        minimize,
        maximize,
        close,
    }

    interface configBuilder {
        pages: Record<string, {
            id: string;
            displayName: string;
            type: 'checkbox' | 'text' | 'number' //add options here
            required: boolean;
            default?: string | boolean | number;
        }[]>
    }


    interface pluginConfigHelper {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        get: (key: string) => any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set: (key: string, value: any) => void
    }

    interface PluginModules { electron, infoStore, express }
    interface FSPlugin {
        start: (PluginModules, pluginConfigHelper) => void;
        stop: () => void;
        infoUpdate: (PluginModules, VideoMetadata, pluginConfigHelper) => void;
        info: {
            name: string;
            auther: string;
            configBuilder: configBuilder;
        }
    }
}


