/* eslint-disable no-irregular-whitespace */
import { readFileSync, writeFileSync } from 'fs';
import { Notification } from 'electron';
import path from 'path';

const errorCodes = [
    'reserved',
    'VideoData is missing',
    'VideoData call failed',
    'Platform is not selected',
];

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


export function formattedErrorBuilder(request: string, errorCode: number): Record<string, unknown> {
    const response: Record<string, unknown> = {
        request: request,
    };
    if (errorCode) {
        response.error = {
            code: errorCode,
            what: errorCodes[errorCode],
        };
    }
    return response;
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
        if (this.getFull()[key] !== null) {
            return this.getFull()[key];
        } else {
            return 'ERROR';
        }
    }
    set(key: string, value: unknown): string {
        if (this.getFull()[key] !== null) {
            const full = this.getFull();
            full[key] = value;
            writeFileSync(
                path.join(this.configFile),
                JSON.stringify(full, null, 4),
            );
            return;
        } else {
            return 'ERROR';
        }
    }
}
