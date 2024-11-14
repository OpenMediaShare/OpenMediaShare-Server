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

    updateClient(uuid, metadata: VideoMetadata, ip) {
        // console.log(this.clients.map(e => e.uuid == '432'));
        this.clients.forEach((client) => {
            if (client.uuid !== uuid) return;
            client.ip = ip;
            client.clientInfo = {
                'creator': metadata.data.creator ?? client.clientInfo.creator,
                'title': metadata.data.title ?? client.clientInfo.title,
                'thumbnail': metadata.data.thumbnail ?? client.clientInfo.thumbnail,
                'playerState': metadata.data.playerState ?? client.clientInfo.playerState ?? 'unknown'
            };
            if (Mainwindow) Mainwindow.webContents.send('clientUpdate', this.clients);
            
        });
    }
    updateClientState(uuid,state: PlayerState) {
        // console.log(this.clients.map(e => e.uuid == '432'));
        this.clients.forEach((client) => {
            if (client.uuid !== uuid) return;
            client.clientInfo.playerState = state ?? 'unknown';
            if (Mainwindow) Mainwindow.webContents.send('clientUpdate', this.clients);
            
        });
    }
    

    addClient(client: Client) {
        console.log('client add:');
        console.log(`    uuid:${client.uuid}`);
        console.log(`    name:${client.name}`);
        this.clients.push(client);
        this.activeClient = client;
        if (!app.isReady()) return;
        new Notification({
            'urgency': 'critical',
            'body': client.uuid,
            'title': 'New Client',
        }).show();
        if (Mainwindow) Mainwindow.webContents.send('clientUpdate', this.clients);
    }

    addClientSilent(client: Client) {
        this.clients.forEach(loopClient => {if(loopClient.uuid == client.uuid) return;});
        this.clients.push(client);
        if (!app.isReady()) return;
        new Notification({
            'urgency': 'critical',
            'body': client.uuid,
            'title': 'New Client (Silent)',
        }).show();
        if (Mainwindow) Mainwindow.webContents.send('clientUpdate', this.clients);
    }

    getClientByUUID(uuid: string): Client{
        let client;
        for (let i=0;i<this.clients.length;i++){
            if (this.clients[i].uuid == uuid) client = this.clients[i];
        }
        return client;
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

    clientExistByUUID(uuid: string){
        let exists = false;
        for (let i=0;i<this.clients.length;i++){
            if (this.clients[i].uuid == uuid) exists = true;
        }
        return exists;
    }
}