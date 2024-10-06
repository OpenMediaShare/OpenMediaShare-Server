import express from 'express';
import http from 'http';
import bodyParser = require('body-parser');
import { formattedErrorBuilder } from './utils';
import { authManager, configStore,store } from './main';
import { WebSocketServer } from 'ws';
import cors from 'cors';

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



// webServer.post('/data/:uuid/:service', (req, res) => {
//     if (store.nullUUID()) {
//         store.setUUID(req.params.uuid);
//     }
//     if (store.notMatchUUID(req.params.uuid)) {
//         return;
//     }
    
//     if (configStore.get('mode') !== req.params.service) {
//         return;
//     }
//     store.setVideo(req.body);
//     store.info.extra.platform = req.params.service;
//     // info.video = req.body;
//     res.send({ OK: true });
// });

// webServer.post('/open/:uuid/:service', (req, res) => {
//     if (store.nullUUID()) {
//         store.setUUID(req.params.uuid);
//         console.log('[restServ] Waiting for close request');
//         res.send(formattedErrorBuilder('/open', 0));
//     } else {
//         console.log('[restServ] Can\'t change source');
//         res.send(formattedErrorBuilder('/open', 0));
//     }
//     res.send({ OK: true });
// });

// webServer.post('/close/:uuid/:service', (req, res) => {
//     if (store.notMatchUUID(req.params.uuid)) {
//         res.send(formattedErrorBuilder('/close', 0));
//         return;
//     }
//     if (store.nullUUID()) {
//         console.log('[restServ] No source to quit');
//         res.send({ OK: true });
//     } else {
//         console.log('[restServ] Got close request');
//         store.blank();
//         res.send({ OK: true });
//     }
//     res.send({ OK: true });
// });

// webServer.post('/time/:uuid/:service', (req, res) => {
//     if (store.nullUUID()) {
//         store.info.extra.uuid = req.params.uuid;
//     }
//     if (store.notMatchUUID(req.params.uuid)) {
//         res.send(formattedErrorBuilder('/time', 0));
//         return;
//     }
//     if (configStore.get('mode') !== req.params.service) {
//         res.send(formattedErrorBuilder('/time', 0));
//         return;
//     }
//     store.setTime(req.body);
//     store.info.extra.platform = req.params.service;
//     //we should do hot reloads before sending a update
//     if (store.info.video.title == 'Waiting for REST API' || store.info.video.title == '') {
//         res.send(formattedErrorBuilder('/time', 2));
//         return;
//     }
//     res.send({ OK: true });
// });

// webServer.options('/ping',cors({origin:'*'}));
// webServer.get('/ping', cors({origin:'*'}), (req,res) => {
//     res.send('pong');
// });

// // Websockets \\
// wss.on('connection', function connection(ws) {
//     let lastMessage = 0;
//     ws.on('error', console.error);
  
//     ws.on('message', (data) => {
//         console.log(`[wss] got: ${data}`);
//     });

//     store.on('infoUpdated',() => {
//         const now = new Date().getTime() / 1000;
//         if (lastMessage == 0 || now - lastMessage >= 5){
//             console.log('potato');

//             let app;
//             console.log(store.info.extra);
//             switch(store.info.extra.platform){
//             case 'applemusic':
//                 app = 'Apple Music';
//                 break;
//             case 'spotify': 
//                 app = 'Spotify';
//                 break;
//             case 'ytmusic':
//                 app = 'Youtube Music';
//                 break;
//             }
            
    
//             const json = {
//                 event: 'setActivity',
//                 app: app,
//                 state: `By ${store.info.video.creator}`,
//                 details: `${store.info.video.title} ${store.info.time.formattedTime}`,
//                 largeImageKey: `${store.info.video.thumbnail}`,
//                 smallImageKey: 'ytlogo4',
//                 smallImageText: 'WatchRPC Plugin',
//                 largeImageText: `${store.info.time.formattedTime} | ${Math.round(
//                     store.info.time.timePercent,
//                 )}%`,
//             };
//             ws.send(JSON.stringify(json));
//             lastMessage = new Date().getTime() / 1000;
//         }
//     });
//     ws.send('something');
// });

export async function restSetup(){
    return new Promise((res,rej) => {
        server.listen(9494)
            .once('listening', res)
            .once('error',rej);
    });
    server.listen(9494, () => {
        console.log('[restServ] Server listening on port 9494');
    });
}

