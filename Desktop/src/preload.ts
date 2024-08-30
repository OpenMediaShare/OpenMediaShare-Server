/* eslint-disable no-irregular-whitespace */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { contextBridge, ipcRenderer } from 'electron';


contextBridge.exposeInMainWorld('controls', {
    minimize: () => ipcRenderer.invoke('winControls', 'minimize'),
    maximize: () => ipcRenderer.invoke('winControls', 'maximize'),
    close: () => ipcRenderer.invoke('winControls', 'close'),
    size: (arg) => ipcRenderer.invoke('size', arg),
});

contextBridge.exposeInMainWorld('settings', {
    settings: () => ipcRenderer.invoke('settings', 'settings'),
    status: (arg) => ipcRenderer.invoke('setOptions', arg),
    getStatus: () => ipcRenderer.invoke('getOptions'),
    forceRefresh: () => ipcRenderer.invoke('forceRefresh'),
});

contextBridge.exposeInMainWorld('theme', {
    setTheme: (theme) => ipcRenderer.invoke('setTheme', theme),
    getTheme: () => ipcRenderer.invoke('getTheme'),
});

ipcRenderer.on('infoUpdate', (event, data) => {
    console.log(data);
    if (location.href.includes('index.html')) {
        updateInfo(data);
    }
});

/**
 * @param {Object} info The json object that contains the video info [read protocol.md]
 */
function updateInfo(info: VideoMetadata) {
    const thumbnail = info.video.thumbnail;
    const title = info.video.title;
    const creator = info.video.creator;
    const formattedTime = info.time.formattedTime;
    const timePercent = info.time.timePercent;
    updateTitle(title, creator);
    updateImage(thumbnail);

    updateProgressBar(formattedTime, timePercent);
}

function updateImage(image) {
    const imageDOM = document.getElementById('video_image');
    console.log(image);
    //check if should use image
    if (image == 'ytlogo') {
        imageDOM.style.height = '35vw';
        imageDOM.style.width = '35vw';
        imageDOM.style.left = '2%';
        imageDOM.style.backgroundImage = 'url(../app/YTlogo4.png)';
    } else {
        imageDOM.style.height = '35vw';
        imageDOM.style.width = '35vw';
        imageDOM.style.left = '1%';
        imageDOM.style.backgroundImage = `url(${image})`;
    }
}

function updateTitle(title: string, creator: string) {
    const titleDOM = document.getElementById('video_name');
    const titleLen = title.length;
    const creatorDOM = document.getElementById('video_creator');
    const creatorLen = creator.length; // 70 + 20

    if (titleLen > 50) { title = title.slice(0,50); title += '. . .';}
    if (creatorLen > 25) { creator = creator.slice(0,20); creator +='. . . '; }

    titleDOM.innerText = title;
    creatorDOM.innerText = creator;
}

function updateProgressBar(formattedTime: string, timePercent: number) {
    const ProgressBar = document.getElementById('time_bar');
    const ProgressText = document.getElementById('time');
    ProgressBar.style.width = `${timePercent}%`;
    ProgressText.innerText = formattedTime.toString();
}




