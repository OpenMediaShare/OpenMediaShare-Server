import express from 'express';
import http from 'http';
import bodyParser = require('body-parser');
import { formattedErrorBuilder } from './utils';
import { authManager, configStore,store } from './main';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { InfoStore } from './infoStore';

export const webServer = express();
const server = new http.Server(webServer);
const wss = new WebSocketServer({ server });


webServer.use(cors({origin: '*'}));
webServer.use(bodyParser.json());
webServer.use((req, res, next) => {
    console.log(`[RestAPI] [Debug] [${req.method}]: ${req.url}`);
    // console.log(req.body);
    // console.log(`    ${JSON.stringify(req.body)}`);
    if (req.method !== 'POST') {next(); return;}
    if (req.body.auth !== undefined && req.body.auth.uuid !== undefined) {next(); return;}
    res.sendStatus(400);
    console.log('[RestAPI] [Warn]: Caught packet without UUID, ignoring.');
    
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
    if (req.body.video){ req.body.data = req.body.video; }
    if (req.body.data){ req.body.video = req.body.data; }
    next(); return;
});


webServer.use((req, res, next) => {
    if (req.method !== 'POST') {next(); return;}
    if (req.url == '/api/auth/openSession') {next(); return;}

    //don't run rest of middleware if incoming uuid has a existing client.
    if (authManager.clientExistByUUID(req.body.auth.uuid)) {
        console.log('[RestAPI] [Debug] [Middleware] uuid exists as client, continue to next function without running middleware.');
        next(); return;
    }

    // Hot Reload!, add client without posting /openSession
    if(authManager.activeClient === null) {
        console.log('[RestAPI] [Debug] [Middleware] No Active Client, using received without checking to see if client exists(this will most likely end up fucking me over later :skull:) ');
        authManager.addClient(req.body.auth);
    } else {
        console.log('[RestAPI] [Debug] [Middleware] Active Client, add new client but don\'t make them active. ');
        const uuidList = authManager.clients.map(c => c.uuid);
        if (uuidList.includes(req.body.auth.uuid)){ next(); return;}
        authManager.addClientSilent(req.body.auth);
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
        ip: req.body.auth.ip // if this doesn't exist something has gone very wrong.
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
    authManager.setActive(req.body.auth);
    res.sendStatus(200);
});

webServer.get('/api/auth/main',(req,res) => {
    res.send({active: authManager.activeClient, all: authManager.clients});
});


// Media Data \\

webServer.post('/api/media/all',(req,res) => {
    console.log(`[RestAPI] [Debug] uuid compare: ${req.body.auth.uuid} =!= ${authManager.activeClient.uuid}`);
    authManager.updateClient(req.body.auth.uuid,req.body,req.ip);
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
webServer.get('/api/controls',(req,res) => {
    res.send(store.info.time);
});

webServer.post('/api/controls/play',(req,res) => {
    res.sendStatus(200);
});

webServer.post('/api/controls/pause',(req,res) => {
    res.sendStatus(200);
});

webServer.post('/api/controls/volume',(req,res) => {
    res.sendStatus(200);
});

webServer.post('/api/controls/rewind',(req,res) => {
    res.sendStatus(200);
});

webServer.post('/api/controls/skip',(req,res) => {
    res.sendStatus(200);
});

webServer.post('/api/controls/status',(req,res) => {
    authManager.updateClientState(req.body.auth.uuid,req.body.data.state);
    store.updateState(req.body.data.state );
    res.sendStatus(200);
});

webServer.get('/api/controls/status',(req,res) => {
    res.send({state: store.info.data.playerState});
});



export async function restSetup(){
    return new Promise((res,rej) => {
        server.listen(9494)
            .once('listening', res)
            .once('error',rej);
    });
}


