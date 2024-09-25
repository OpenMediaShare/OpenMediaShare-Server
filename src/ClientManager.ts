import { electron } from 'process';
import { PushError } from './utils';
import { app, Notification } from 'electron';
import { Mainwindow } from './main';


export class AuthManager {
    clients: Client[];
    activeClient: Client | {uuid: string};
    constructor(){
        this.clients = [];
        this.activeClient = null;
    }

    updateClient(uuid, videoMetadata: VideoMetadata, ip) {
        // console.log(this.clients.map(e => e.uuid == '432'));
        this.clients.forEach((client) => {
            if (client.uuid !== uuid) return;
            if (ip == '::1' || ip == '::ffff:127.0.0.1') ip = '127.0.0.1';
            client.ip = ip;
            // if (client.clientInfo.title == videoMetadata.video.title) return;
            client.clientInfo = {
                'creator': videoMetadata.video.creator,
                'title': videoMetadata.video.title,
                'thumbnail': videoMetadata.video.thumbnail,
                'playerState': 'fucked'
            };
            if (Mainwindow) Mainwindow.webContents.send('clientUpdate', this.clients);
            
        });
    }

    addClient(client: Client) {
        this.clients.push(client);
        this.activeClient = client;
        if (!app.isReady()) return;
        new Notification({
            'urgency': 'critical',
            'body': client.uuid,
            'title': 'New Client',
        }).show();
    }

    addClientSilent(client: Client) {
        this.clients.push(client);
        if (!app.isReady()) return;
        new Notification({
            'urgency': 'critical',
            'body': client.uuid,
            'title': 'New Client (Silent)',
        }).show();
    }

    removeClientByName(name: string) {
        for(let i=0;i<this.clients.length;i++) {
            if(this.clients[i].name == name) {
                this.clients.splice(i, 1);
                if (!app.isReady()) return;
                new Notification({
                    'urgency': 'critical',
                    'body': name,
                    'title': 'Removed Client (Name)',
                }).show();
                return;
            }
        }
    }

    removeClientByUUID(uuid: string) {
        for(let i=0;i<this.clients.length;i++) {
            if(this.clients[i].uuid == uuid) {
                this.clients.splice(i, 1);
                if (!app.isReady()) return;
                new Notification({
                    'urgency': 'critical',
                    'body': uuid,
                    'title': 'Removed Client (UUID)',
                }).show();
                return;
            }
        }
    }

    setActive(client: Client) {
        this.activeClient = client;
        if (!app.isReady()) return;
        new Notification({
            'urgency': 'critical',
            'body': client.uuid,
            'title': 'New Active Client',
        }).show();
        
    }
}