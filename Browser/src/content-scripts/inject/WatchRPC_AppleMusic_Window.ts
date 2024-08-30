// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
let lastState = false;

const button = document.createElement('li');
button.classList.add('navigation-item','navigation-item__home');
button.innerText = 'Set Active';
button.onclick = () => {
    window.postMessage({ from: 'WatchRPC_AppleMusic_Window',data: {event: 'active'} });
};

document.querySelector('.navigation-items__list').appendChild(button);

setInterval(() => {
    const data = {
        currentPlaybackProgress: window.audioPlayer.currentPlaybackProgress,
        currentPlaybackTimeRemaining: window.audioPlayer.currentPlaybackTimeRemaining,
        currentPlaybackTime: window.audioPlayer.currentPlaybackTime,
        currentPlaybackDuration: window.audioPlayer.currentPlaybackDuration,
        event:'audioPlayerTime'
    };
    window.postMessage({ from: 'WatchRPC_AppleMusic_Window',data: data });

    if (lastState == window.audioPlayer.isPlaying) return;
    lastState = window.audioPlayer.isPlaying;
    window.postMessage({ from: 'WatchRPC_AppleMusic_Window', data: {event: 'active'} });
    
},2500);
