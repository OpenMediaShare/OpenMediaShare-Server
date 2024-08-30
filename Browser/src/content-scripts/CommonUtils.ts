/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */

//@ts-ignore | This is added to some function and var because typescript thinks all the files are part of a block or global scope when infact there loaded into diffrent browser windows.
// This is needed because it does change just not in this file. This is inside the window scope and a diffrent injected script changes it.
// eslint-disable-next-line prefer-const 
let time = 0;


//@ts-ignore | This is added to some function and var because typescript thinks all the files are part of a block or global scope when infact there loaded into diffrent browser windows.
const config = {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
    timeout: -1,
};



const info: VideoMetadata = {
    video: {
        creator: '',
        title: '',
        views: '',
        likes: '',
        thumbnail: '',
        url: '',
    },
    time: {
        curruntTime: 0,
        totalTime: 0,
        timePercent: 0,
        formattedTime: '',
    },
    auth: {
        uuid: crypto.randomUUID(),
        name: 'Apple Music'
    },
};

//@ts-ignore | This is added to some function and var because typescript thinks all the files are part of a block or global scope when infact there loaded into diffrent browser windows.
function secondsToFormat(seconds){
    const m = Math.round(Math.floor(seconds / 60));
    let s: string | number = Math.round(seconds - m * 60);
    if (s < 10){s = `0${s}`;}
    return [m,s];
}

// function clientSendVideo(){
//     //Try to get video data into info even if mutationobserver is not working
//     scriptGetVideo();
//     chrome.runtime.sendMessage(
//         {
//             type: 'exportFetch',
//             fetch: {
//                 url:`http://localhost:9494/data/${info.auth.uuid}/${info.auth.platform}`,
//                 method: 'POST',
//                 body: JSON.stringify(info.video)
//             }
//         },
//         async (_response) => {
//             if(_response.error){
//                 switch(_response.error.code){
//                     default:
//                         console.error(_response.error);
//                         break;
//                 }
//             }
//         },
//     );
// }

function clientSendData(){
    scriptGetVideo();
    
    chrome.runtime.sendMessage(
        {
            type: 'exportFetch',
            fetch: {
                url:'http://localhost:9494/api/media/all',
                method: 'POST',
                body: JSON.stringify(info)
            }
        },
        async (_response) => {
            if(_response.error){          
                switch(_response.error.code){
                    default:
                        console.error(_response.error);
                        break;

                    case 2:
                        console.error('missing video data');
                        clientSendData();
                        // clientSendVideo();
                }
            }
        },
    );
}

function setActive(){
    chrome.runtime.sendMessage(
        {
            type: 'exportFetch',
            fetch: {
                url:'http://localhost:9494/api/auth/main',
                method: 'POST',
                body: JSON.stringify({auth: {uuid: info.auth.uuid}})
            }
        },
        async (_response) => {
            if(_response.error){          
                switch(_response.error.code){
                    default:
                        console.error(_response.error);
                        break;

                }
            }
        },
    );
}

function openSession(){
    chrome.runtime.sendMessage(
        {
            type: 'exportFetch',
            fetch: {
                url:'http://localhost:9494/api/auth/openSession',
                method: 'POST',
                body: JSON.stringify({auth: {uuid: info.auth.uuid}})
            }
        },
        async (_response) => {
            if(_response.error){          
                switch(_response.error.code){
                    default:
                        console.error(_response.error);
                        break;

                }
            }
        },
    );
}

function endSession(){
    chrome.runtime.sendMessage(
        {
            type: 'exportFetch',
            fetch: {
                url:'http://localhost:9494/api/auth/closeSession',
                method: 'DELETE',
                body: JSON.stringify({auth: {uuid: info.auth.uuid}})
            }
        },
        async (_response) => {
            if(_response.error){          
                switch(_response.error.code){
                    default:
                        console.error(_response.error);
                        break;

                }
            }
        },
    );
}


function awaitElementLoad(element,callback){
    const contentLoadedTimer = setInterval(() => {
        if(typeof(element()) !== 'object'){
            console.log('element is not loaded');
            //element doesn't exist yet, wait a second and hope for the best
        }else{
            clearInterval(contentLoadedTimer);
            console.log('element loaded');
            openSession();
            callback();
            return true;
        }
    },1000);
}

function setService(name){
    info.auth.name = name;
}