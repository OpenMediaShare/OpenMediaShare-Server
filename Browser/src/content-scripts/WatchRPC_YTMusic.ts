/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-ignore | This is added to some function and var because typescript thinks all the files are part of a block or global scope when infact there loaded into diffrent browser windows.

const target_title = document.getElementsByClassName(
    'title style-scope ytmusic-player-bar',
)[0];

//@ts-ignore | This is added to some function and var because typescript thinks all the files are part of a block or global scope when infact there loaded into diffrent browser windows.
const observer = new MutationObserver((_mutationList, _observer) => {
    clientSendVideo();
});

//@ts-ignore | This is added to some function and var because typescript thinks all the files are part of a block or global scope when infact there loaded into diffrent browser windows.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function scriptGetVideo(){
    const title = (<HTMLParagraphElement>document.getElementsByClassName('title style-scope ytmusic-player-bar',)[0]).title;
    const subInfo = document.getElementsByClassName('byline style-scope ytmusic-player-bar complex-string')[0];
    const creator = subInfo.querySelector('a').innerText;
    const artLink = (<HTMLImageElement>document.getElementsByClassName('image style-scope ytmusic-player-bar',)[0]).src;
    console.log(
        `====================\n${title}\nBy ${creator}\n====================`,
    );
    info.video = {
        'creator': creator,
        'title': title,
        'thumbnail': artLink,
        'url': window.location.href
    };
}

//@ts-ignore | This is added to some function and var because typescript thinks all the files are part of a block or global scope when infact there loaded into diffrent browser windows.
function main() {
    info.extra.platform = 'ytmusic';
    console.log('element should be loaded');
    document.querySelector('video').addEventListener('timeupdate', async (_e) => {
        const _cTime = (<HTMLMediaElement>_e.target).currentTime;
        const _tTime = (<HTMLMediaElement>_e.target).duration;
        if (time == 0){ time = Math.round(_cTime);}
        if (Math.round(_cTime) == Math.round(time)){return;}
        else{
            const fct = secondsToFormat(_cTime); //formated current time
            const ftt = secondsToFormat(_tTime); //formated total time
            console.log(`${fct[0]}:${fct[1]} / ${ftt[0]}:${ftt[1]}`);
            info.time = {
                'curruntTime':_cTime,
                'totalTime':_tTime,
                'timePercent': (_cTime / _tTime) * 100,
                'formattedTime': `${fct[0]}:${fct[1]} / ${ftt[0]}:${ftt[1]}`
            };
            clientSendTime();
        }
    });
    observer.observe(target_title, config);
}
awaitElementLoad(() => {return document.getElementsByClassName('title style-scope ytmusic-player-bar',)[0];},main);