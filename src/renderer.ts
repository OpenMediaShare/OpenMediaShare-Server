// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck

document.getElementById('close_button').addEventListener('click', (e) => { unload(e); });
window.addEventListener('beforeunload', (e) =>{ unload(e); });

function unload(e){
    console.log(e);
    console.log(`Current Service: ${document.getElementById('services').value}`,);
    console.log(`showTTY: ${document.getElementById('TTY').checked}`);
    window.settings.status({
        showTTy: document.getElementById('TTY').checked,
        service: `${document.getElementById('services').value}`,
        errNote: document.getElementById('ErrNote').checked,
        RPCServer: document.getElementById('RPCServer').checked
    });
    window.controls.close();
    loadThemeByName(document.getElementById('theme').value);
    window.settings.forceRefresh();
}

windowAction = {
    minimize: () => {
        window.controls.minimize();
    },
    close: () => {
        window.controls.close();
    },
};


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function button(text) {
    switch (text) {
    case 'index':
        location.href = 'index.html';
        break;
    case 'settings':
        location.href = 'settings.html';
        break;
    }
}
