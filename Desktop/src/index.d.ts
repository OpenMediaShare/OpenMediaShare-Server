export { };

declare global {
    interface Window {
        theme: {
            setTheme: (string) => void
            getTheme: () => void
        },
        settings: {
            forceRefresh: () => void
        }
    }

    interface VideoMetadata {
        video: {
            creator: string;
            title: string;
            views?: string;
            likes?: string;
            thumbnail: string;
            url: string;
        };
        time: {
            curruntTime: number;
            totalTime: number;
            timePercent: number;
            formattedTime: string;
        };
        auth: {
            uuid: string,
            name: string
        }
    }
    
    enum WinControls {
        minimize,
        maximize,
        close,
    }

}
