/* eslint-disable @typescript-eslint/no-explicit-any */

import { EventEmitter } from 'events';

class TypedEventEmitter<TEvents extends Record<string, any>> {
    private emitter = new EventEmitter();

    protected emit<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        ...eventArg: TEvents[TEventName]
    ) {
        this.emitter.emit(eventName, ...(eventArg as []));
    }
    on<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        handler: (...eventArg: TEvents[TEventName]) => void
    ) {
        this.emitter.on(eventName, handler as any);
    }

    off<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        handler: (...eventArg: TEvents[TEventName]) => void
    ) {
        this.emitter.off(eventName, handler as any);
    }

    once<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        handler: (...eventArg: TEvents[TEventName]) => void
    ) {
        this.emitter.once(eventName, handler as any);
    }
}

type LocalEventTypes = {
    videoUpdated: [
        video: VideoMetadata['data']
    ],
    timeUpdated: [
        time: VideoMetadata['time']
    ]
    extraUpdated: [
        extra: VideoMetadata['auth']
    ],
    infoUpdated: [
        info: VideoMetadata
    ],
    playerStateChange: [PlayerState];
}


export class InfoStore extends TypedEventEmitter<LocalEventTypes>{
    info: VideoMetadata = {
        data: {
            creator: '',
            title: '',
            views: '',
            likes: '',
            thumbnail: '',
            url: '',
            color: undefined,
            lyrics: [],
            playerState: 'playing'
        },
        time: {
            curruntTime: 0,
            totalTime: 0,
            timePercent: 0,
            formattedTime: ''
        },
        auth: undefined,
        requests: {}
    };
    constructor() {
        super();
    }

    /** @deprecated */
    setVideo(video: VideoMetadata['data']) {
        this.info.data = video;
        this.emit('videoUpdated', video);
        this.emit('infoUpdated', this.info);
    }

    /** @deprecated */
    setTime(time: VideoMetadata['time']) {
        this.info.time = time;
        this.emit('timeUpdated', time);
        this.emit('infoUpdated', this.info);
    }

    /** @deprecated */
    setAuth(extra: VideoMetadata['auth']) {
        this.info.auth = extra;
        this.emit('extraUpdated', extra);
        this.emit('infoUpdated', this.info);
    }

    setAll(metadata: VideoMetadata){
        this.info = metadata;
        this.emit('infoUpdated', this.info);
    }

    updateState(state: PlayerState){
        this.info.data.playerState = state ?? 'unknown';
        this.emit('playerStateChange', state);
    }

    // notMatchUUID(uuid) { //checks if the uuid provided matches the saved uuid, if it doesn't match it returns true
    //     if (this.info.auth.uuid !== uuid) return true;
    // }

    // nullUUID() {
    //     if (this.info.auth.uuid == '') return true;
    // }

    // setUUID(uuid) {
    //     this.info.auth.uuid = uuid;
    // }


    blank() {
        this.info = {
            data: {
                creator: 'WatchRPC v3',
                title: 'Waiting for REST API',
                views: '',
                likes: '',
                thumbnail: 'ytlogo',
                url: 'https://waterwolf.net/projects/watchrpc',
                playerState: 'unknown'
            },
            time: {
                curruntTime: 0,
                totalTime: 0,
                timePercent: 0,
                formattedTime: '',
            },
            auth: {
                uuid: undefined,
                name: undefined,
                service: ''
            },
            requests: {}
        };
    }
}