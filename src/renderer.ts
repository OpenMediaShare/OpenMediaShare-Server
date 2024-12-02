// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck



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


const buttons = document.getElementsByClassName('sidebar-item');
Array.from(buttons).forEach(el => {
    el.addEventListener('click',(e) => {
        console.log(e.target.id);
        const lastActive = document.querySelector('.sidebar-item-active');
        const newActive = document.getElementById(e.target.id);


        const lastActivePage = document.querySelector('.active-page');
        const newActivePage = document.getElementById(`${e.target.id.split('-')[0]}-page`);
        console.log(lastActivePage);
        console.log(newActivePage);

        

        lastActive.classList.remove('sidebar-item-active');
        newActive.classList.add('sidebar-item-active');

        newActivePage.classList.remove('inactive-page');
        lastActivePage.classList.add('inactive-page');

        lastActivePage.classList.remove('active-page');
        newActivePage.classList.add('active-page');
    });
});


const configSettings = [
    {
        type: 'boolean',
        key: 'debug',
        title: 'Enable Debugging Logs',
        desc: 'Enables debug messages in the terminal and enables the debug ui on port 4949'
    },
    {
        type: 'boolean',
        key: 'debugNotification',
        title: 'Enable Debugging Notification',
        desc: 'Enables debug desktop notifications.'
    }
];


const settingsPage = document.querySelector('#settings-page .grid-container');
configSettings.forEach(async (setting) => {
    const checked = await window.settings.get(setting.key);
    const el = document.createElement('div');
    el.id = setting.key;
    el.classList.add('plugin','settings-item');
    const booleanHtml = 
    `
            <div class="plugin-details">
                <div class="plugin-topbar">
                    <span class="plugin-title">
                        ${setting.title ?? setting.key}
                    </span>
                    <label class="switch">
                        <input id="${setting.key}-checkbox" type="checkbox" ${checked ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <span>${setting.desc ?? 'No Desc'}</span>
            </div>

    `;
    
    el.innerHTML = booleanHtml;
    settingsPage.appendChild(el);
    document.getElementById(`${setting.key}-checkbox`).addEventListener('click',(e) => {
        window.settings.set(setting.key,e.target.checked);
        console.log(`${setting.key}:${e.target.checked}`);
    });
});


// .forEach((el: HTMLElement) => {
//     el.addEventListener('click',(e) => {
//         console.log(e.target);
//     });
// });