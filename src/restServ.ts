import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';

import { authManager, configStore, store } from './main';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { Logger } from './logger';

function boardcastToWSClients(json: object){
    wss.clients.forEach(client => {
        client.send(JSON.stringify(json));
    });
}

export const webServer = express();

const server = new http.Server(webServer);
const wss = new WebSocketServer({ noServer:true });
const logger = new Logger();



webServer.use(cors({origin: '*'}));
webServer.use(bodyParser.json());
webServer.use((req, res, next) => {
    logger.dinfo(['WebServ','Middleware',req.method],`${req.url}`);
    if(configStore.get('debug')){
        console.log(req.body);
    }
    
    if (req.method !== 'POST') {next(); return;}
    if (req.body.auth !== undefined && req.body.auth.uuid !== undefined) {next(); return;}
    res.sendStatus(400);
    logger.dwarn(['WebServ','Middleware'],'Caught packet without UUID, ignoring.');

});

webServer.use((req, res, next) => {
    if (req.method !== 'POST') {next(); return;}
    let ip = req.ip;
    if (ip == '::1' || ip == '::ffff:127.0.0.1') ip = '127.0.0.1';
    req.body.auth.ip = ip;
    next(); return;
});

webServer.use((req, res, next) => {
    //WARNING DO NOT USE body.video IT IS DEPRECATED AND WILL BE REMOVED IN A LATER UPDATE!!! 
    //Please switch to body.data that has all the same properties.

    //fix old providers and apps that still use video instead of info 
    if (req.body !== undefined) {
        if (req.body.video){ req.body.data = req.body.video; }
        if (req.body.data){ req.body.video = req.body.data; }
    }

    next(); return;
});


webServer.use((req, res, next) => {
    if (req.method !== 'POST') {next(); return;}
    if (req.url == '/api/auth/openSession') {next(); return;}

    //don't run rest of middleware if incoming uuid has a existing client.
    if (authManager.clientExistByUUID(req.body.auth.uuid)) {
        logger.dinfo(['WebServ','Middleware'],'uuid exists as client, continue to next function without running middleware.');
        next(); return;
    }
    
    // Hot Reload!, add client without posting /openSession
    if(authManager.activeClient === null) {
        logger.dinfo(['WebServ','Middleware'],'No Active Client, using received without checking to see if client exists(this will most likely end up fucking me over later :skull:) ');
        if (authManager.clientExistByUUID(req.body.auth.uuid)){
            logger.dwarn(['WebServ','Middleware'],'Client exists, not creating new one (This should not fuck me over like the above. :3)');
            authManager.setActive(req.body.auth);
        } else {
            authManager.addClient(req.body.auth);
        }

    } else {
        logger.dinfo(['WebServ','Middleware'],'Active Client, add new client but don\'t make them active.');

        const uuidList = authManager.clients.map(c => c.uuid);
        if (uuidList.includes(req.body.auth.uuid)){ next(); return;}
        authManager.addClientSilent(req.body.auth);
    }
    if (req.body.time !== undefined && req.body.auth !== undefined){
        logger.dinfo(['WebServ','Middleware'],'Updateing Client Info');

        authManager.updateClient(req.body,req.ip);
    }

    next();
    return;
});

// Auth \\

webServer.post('/api/auth/openSession',(req,res) => {
    if (authManager.clientExistByUUID(req.body.auth.uuid)) {res.sendStatus(409); return;}
    authManager.addClient({
        uuid: req.body.auth.uuid,
        name: req.body.auth.name ?? 'unknown',
        service: req.body.auth.service ?? 'unknown',
        ip: req.body.auth.ip, // if this doesn't exist something has gone very wrong.

    });
    res.sendStatus(200);
});

webServer.post('/api/auth/closeSession',(req,res) => {
    authManager.removeClientByUUID(req.body.auth.uuid);
    res.sendStatus(200);
});


webServer.delete('/api/auth/closeSession',(req,res) => {
    authManager.removeClientByUUID(req.body.auth.uuid);
    res.sendStatus(200);
});


webServer.post('/api/auth/main',(req,res) => {
    // if(req.body.auth.uuid == authManager.activeClient.uuid) {res.sendStatus(200); return;}
    if (!authManager.clientExistByUUID(req.body.auth.uuid)) return;
    authManager.setActive(req.body.auth);
    res.sendStatus(200);
});

webServer.get('/api/auth/main',(req,res) => {
    res.send({active: authManager.activeClient, all: authManager.clients});
});



// Media Data \\

webServer.post('/api/media/all',(req,res) => {
    logger.dinfo(['WebServ','Middleware','UUID-Compare'],`${req.body.auth.uuid} =!= ${authManager.activeClient.uuid}`);

    authManager.updateClient(req.body,req.ip);
    if(req.body.auth.uuid !== authManager.activeClient.uuid) {
        res.sendStatus(200);
        return;
    }
    store.setAll(req.body);
    res.sendStatus(200);
});

webServer.get('/api/media/all',(req,res) => {
    res.send(store.info);
});

webServer.get('/api/media/video',(req,res) => {
    res.send(store.info.data);
});

webServer.get('/api/media/time',(req,res) => {
    res.send(store.info.time);
});


// Controls 
webServer.get('/api/controls/:uuid/',(req,res) => {
    //add support for diffrent clients 
    if (store.info.auth == undefined) {res.sendStatus(403); return;}
    if (store.info.auth.uuid == undefined) {res.sendStatus(403); return;}
    if (req.params.uuid !== store.info.auth.uuid) {res.sendStatus(401); return;}
    res.send(store.info.requests);
    store.info.requests = {};
});

webServer.put('/api/controls/play',(req,res) => {
    store.info.requests = {play: true};
    res.sendStatus(200);
    boardcastToWSClients({event: 'playEvent',play: true});
});

webServer.put('/api/controls/pause',(req,res) => {
    store.info.requests = {pause: true};
    res.sendStatus(200);
    boardcastToWSClients({event: 'pauseEvent',pause: true});
});

webServer.put('/api/controls/volume/:volume',(req,res) => {
    store.info.requests = {volume: parseFloat(req.params.volume)};
    res.sendStatus(200);
    boardcastToWSClients({event: 'volume',volume: parseFloat(req.params.volume)});
});

webServer.put('/api/controls/rewind',(req,res) => {
    store.info.requests = {rewind: true};
    res.sendStatus(200);
    boardcastToWSClients({event: 'rewindEvent',rewind: true});
});

webServer.put('/api/controls/skip',(req,res) => {
    store.info.requests = {skip: true};
    res.sendStatus(200);
    boardcastToWSClients({event: 'skipEvent',skip: true});
});

webServer.put('/api/controls/seek/percent/:percentFloat/',(req,res) => {
    const float = parseFloat(req.params.percentFloat) ?? 0.0;
    const seconds = float * store.info.time.totalTime;
    
    store.info.requests = {seek: seconds};
    res.sendStatus(200);
    boardcastToWSClients({event: 'seekEvent',seek: seconds});
});

webServer.post('/api/controls/status',(req,res) => {
    authManager.updateClientState(req.body.auth.uuid,req.body.data.playerState);
    store.updateState(req.body.data.playerState );
    res.sendStatus(200);
});

webServer.get('/api/controls/status',(req,res) => {
    res.send({state: store.info.data.playerState});
});



server.on('upgrade',(req,socket,head) => {
    wss.handleUpgrade(req,socket,head,(sock) => {
        // store.on('playerStateChange',(state) => {
        //     sock.send(JSON.stringify({event: 'stateUpdate',body: state}));
        // });
        // store.on('infoUpdated',(info) => {
        //     sock.send(JSON.stringify({event: 'allUpdate',body: info}));
        // });
        sock.send(JSON.stringify({event: 'Connected'}));
    });
});

export async function restSetup(){
    return new Promise((res,rej) => {
        server.listen(9494)
            .once('listening', res)
            .once('error',rej);
    });
}


