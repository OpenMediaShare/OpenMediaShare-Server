interface VideoMetadata {
    video: {
        creator: string;
        title: string;
        views?: string;
        likes?: string;
        thumbnail: string;
        url: string;
    };
    time: {
        curruntTime: number;
        totalTime: number;
        timePercent: number;
        formattedTime: string;
    };
    auth: {
        uuid: string;
        name: string
    };
}

window.addEventListener('load', (_event) => {
    console.log('page is fully loaded');
    const test = {
        image: 'https://i.imgur.com/hX8zaIm.png',
        name: 'Video Name',
        creator: 'Video Creater',
    };
    refreshINFO(test);
    try {
        chrome.runtime.sendMessage(
            { type: 'getVideoData', data: '' },
            (response: VideoMetadata['video']) => {
                console.log('[WatchRPC] [popup] received: ', response);
                if (!response) {
                    console.log('[WatchRPC] [popup] No Data');
                    return;
                }
                refreshINFO({
                    image: response.thumbnail,
                    name: response.title,
                    creator: response.creator,
                });
            },
        );
    } catch (err) {
        console.log(err);
    }
});




function changeBackground(url) {
    document.getElementById(
        'popup-content',
    ).style.backgroundImage = `url('${url}')`;
}

function refreshINFO(
    JSON = {
        image: '',
        name: 'No Name',
        creator: 'No Creator',
    },
) {
    changeBackground(JSON.image);
    document.getElementById('videoName').innerText = JSON.name;
    document.getElementById('videoCreator').innerText = JSON.creator;
}
