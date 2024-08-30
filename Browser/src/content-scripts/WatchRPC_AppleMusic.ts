/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-ignore | This is added to some function and var because typescript thinks all the files are part of a block or global scope when infact there loaded into diffrent browser windows.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function scriptGetVideo(){
    const title = (document.getElementsByClassName('lcd lcd__music')[0].shadowRoot.querySelectorAll('.lcd-meta__primary > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > span:nth-child(1) > span:nth-child(1)')[0] as HTMLDivElement).innerText;
    const creator = (document.getElementsByClassName('lcd lcd__music')[0].shadowRoot.querySelectorAll('.lcd-meta__secondary > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > span:nth-child(1)')[0] as HTMLDivElement).innerText.split('\n')[0];
    const artLink = (document.getElementsByClassName('lcd lcd__music')[0].shadowRoot.querySelectorAll('.lcd__artwork-img')[0] as HTMLImageElement).src;
    info.video = {
        'creator': creator,
        'title': title,
        'thumbnail': artLink,
        'url': window.location.href
    };
}
//@ts-ignore | This is added to some function and var because typescript thinks all the files are part of a block or global scope when infact there loaded into diffrent browser windows.
function main() {
    const target_title = document.getElementsByClassName('lcd lcd__music')[0].shadowRoot.querySelectorAll('.lcd-meta__primary > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > span:nth-child(1) > span:nth-child(1)')[0];
    const observer = new MutationObserver((_mutationList, _observer) => { clientSendData(); });
    setService('applemusic');

    function injectScript(file_path, tag) {
        const node = document.getElementsByTagName(tag)[0];
        const script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', file_path);
        node.appendChild(script);
    }

    function handleFromInject(message) {
        if (message.data.from == 'WatchRPC_AppleMusic_Window') {
            const { data } = message.data;
            const event = data.event;
            switch (event) {
                default:
                    break;
                
                case 'active': 
                    setActive();
                    break;
                case 'audioPlayerTime':
                    try {
                        const _tTime = data.currentPlaybackDuration;
                        const _cTime = data.currentPlaybackTime;
                        const fct = secondsToFormat(_cTime); //formated current time
                        const ftt = secondsToFormat(_tTime); //formated total time
                        console.log(`${fct[0]}:${fct[1]} / ${ftt[0]}:${ftt[1]}`);
                        info.time = {
                            'curruntTime':_cTime,
                            'totalTime':_tTime,
                            'timePercent': (_cTime / _tTime) * 100,
                            'formattedTime': `${fct[0]}:${fct[1]} / ${ftt[0]}:${ftt[1]}`
                        };
                        scriptGetVideo();
                        clientSendData();
                    }catch(err){
                        console.log(err);
                    }
                    break;
            }
        }
    }





    injectScript(chrome.extension.getURL('dist/content-scripts/inject/WatchRPC_AppleMusic_Window.js'), 'body');
    window.addEventListener('message', handleFromInject);
    observer.observe(target_title, config);
}
awaitElementLoad(() => { return document.getElementsByClassName('lcd lcd__music')[0].shadowRoot.querySelectorAll('.lcd-meta__primary > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > span:nth-child(1) > span:nth-child(1)')[0]; }, main);