import { configStore } from './main';

const colors = {
    clear: '\x1b[0m',
    cyan: '\x1b[36m', //43
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    brightGreen: '\x1b[92m',
    blue: '\x1b[34m',
    purple: '\x1b[35m',


    warning: '\x1b[93;1;4m',
    warning2: '\x1b[96;1;4m',
    red: '\x1b[91;1m'
};



export class Logger {
    name: string | 'Post' | 'Get' | 'Put';
    type: string | 'Main' | 'Middleware' | 'Rest' | 'Plugin' | 'UUID Compare' | 'Other';
    timeFormatter: (date?: Date | number) => string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor() {

        this.timeFormatter = new Intl.DateTimeFormat('en-US',{dateStyle: 'short','timeStyle': 'medium','hourCycle':'h24'}).format;
    }


    info(type: string[], text: string) {
        let logMessage = `${colors.brightGreen}INFO${colors.clear} | ${this.timeFormatter(Date.now())} | `;
        type.forEach(type => {
            logMessage += `${type} | `;
        });
        logMessage += text;

        console.log(logMessage);
    }

    dinfo(type: string[], text: string) {
        if(!configStore.get('debug')) return;
        let logMessage = `${colors.purple}DEBUG${colors.clear} | ${this.timeFormatter(Date.now())} | `;
        type.forEach(type => {
            logMessage += `${type} | `;
        });
        logMessage += text;

        console.log(logMessage);
    }

    warn(type: string[], text: string) {
        let logMessage = `${colors.purple}DEBUG${colors.clear} ${colors.yellow}WARN${colors.clear} | ${this.timeFormatter(Date.now())} | `;
        type.forEach(type => {
            logMessage += `${type} | `;
        });
        logMessage += text;

        console.log(logMessage);
    }

    dwarn(type: string[], text: string) {
        if(!configStore.get('debug')) return;
        let logMessage = `${colors.purple}DEBUG${colors.clear} ${colors.yellow}WARN${colors.clear} | ${this.timeFormatter(Date.now())} | `;
        type.forEach(type => {
            logMessage += `${type} | `;
        });
        logMessage += text;

        console.log(logMessage);
    }

    error(type: string[], text: string) {
        let logMessage = `${colors.purple}DEBUG${colors.clear} ${colors.red}ERROR${colors.clear} | ${this.timeFormatter(Date.now())} | `;
        type.forEach(type => {
            logMessage += `${type} | `;
        });
        logMessage += text;

        console.log(logMessage);
    }

    derror(type: string[], text: string) {
        if(!configStore.get('debug')) return;
        let logMessage = `${colors.red}ERROR${colors.clear} | ${this.timeFormatter(Date.now())} | `;
        type.forEach(type => {
            logMessage += `${type} | `;
        });
        logMessage += text;

        console.log(logMessage);
    }
}