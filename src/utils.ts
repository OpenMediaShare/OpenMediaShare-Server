/* eslint-disable no-irregular-whitespace */
import { readFileSync, writeFileSync } from 'fs';
import { Notification } from 'electron';
import path from 'path';
import EventEmitter from 'events';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class TypedEventEmitterClass<TEvents extends Record<string, any>> {
    private emitter = new EventEmitter();

    emit<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        ...eventArg: TEvents[TEventName]
    ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.emitter.emit(eventName, ...(eventArg as []));
    }
    on<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        handler: (...eventArg: TEvents[TEventName]) => void
    ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.emitter.on(eventName, handler as any);
    }

    off<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        handler: (...eventArg: TEvents[TEventName]) => void
    ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.emitter.off(eventName, handler as any);
    }

    once<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        handler: (...eventArg: TEvents[TEventName]) => void
    ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.emitter.once(eventName, handler as any);
    }

}


export function formattedTimeBuilder(currentSeconds: number, totalSeconds: number): string {
    const cmins = Math.floor(currentSeconds / 60);
    let csecs: number | string = Math.floor(currentSeconds - cmins * 60);
    const tmins = Math.floor(totalSeconds / 60);
    const tsecs = Math.floor(totalSeconds - tmins * 60);
    console.log(`${tmins}:${tsecs}`);
    if (/^\d$/.test(csecs.toString())) {
        csecs = `0${csecs}`;
    }
    return `${cmins}:${csecs} / ${tmins}:${tsecs}`;
}





export function PushError(title: string, body: string){
    // console.log(Notification.isSupported());
    new Notification({
        'urgency': 'critical',
        'body': body,
        'title': title,
    }).show();
}


export class ConfigHelper {
    configFile: string;
    constructor(configFile: string) {
        this.configFile = configFile;
    }
    getFull(): Record<string, unknown> {
        return JSON.parse(readFileSync(this.configFile, 'utf-8'));
    }

    get(key: string): unknown {
        if (this.getFull()[key] == null) {
            this.set(key,null) ;
        }
        return this.getFull()[key];
        // if (this.getFull()[key] !== null) {
        //     return this.getFull()[key];
        // } else {
        //     return null;
        // }
    }
    set(key: string, value: unknown): string {
        const full = this.getFull();
        full[key] = value;
        writeFileSync(
            path.join(this.configFile),
            JSON.stringify(full, null, 4),
        );
        return;
        // if (this.getFull()[key] !== null) {
        //     const full = this.getFull();
        //     full[key] = value;
        //     writeFileSync(
        //         path.join(this.configFile),
        //         JSON.stringify(full, null, 4),
        //     );
        //     return;
        // } else {
        //     return 'ERROR';
        // }
    }
}
