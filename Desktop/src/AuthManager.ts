import { electron } from 'process';
import { PushError } from './utils';
import { app, Notification } from 'electron';
interface Client {
    name: string,
    uuid: string
}

export class AuthManager {
    clients: Client[];
    activeClient: Client;
    constructor(){
        this.clients = [];
        this.activeClient = null;
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