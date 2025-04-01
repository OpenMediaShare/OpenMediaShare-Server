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


const sideTabs = document.getElementsByClassName('side-tab');
Array.from(sideTabs).forEach(el => {
    el.addEventListener('click',(e) => {
        console.log(e.target.id);
        const lastActive = document.querySelector('.sidebar-item-active');
        const newActive = document.getElementById(e.target.id);
        if (lastActive.id == newActive.id) return;

        const lastActivePage = document.querySelector('.active-page');
        const newActivePage = document.getElementById(`${e.target.id.split('-')[0]}-page`);

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

function drawPlugins(plugins: FSPlugin['info'][]) {
    const pluginPage = document.getElementById('plugin-settings-grid');
    for (const [index,plugin] of plugins.entries()) {
        console.log(plugin.name);
        const html = `
        <div class="plugin-details">
            <div class="plugin-topbar">
                <span class="plugin-title">${plugin.name}</span>
                <span class="material-symbols-outlined">
                    settings
                </span>
                <label class="switch">
                    <input type="checkbox" checked=${plugin.isRunning}>
                    <span class="slider"></span>
                </label>
            </div>
            <span class="plugin-author">By ${plugin.author}</span><br />
            <span>${plugin.description ?? ''}</span>
        </div>
    `;
        const pluginEl = document.createElement('div');
        pluginEl.id = `${index}-plugin`;
        pluginEl.classList.add('plugin');
        pluginEl.innerHTML = html;
        pluginPage.appendChild(pluginEl);

        (pluginEl.querySelector('.material-symbols-outlined') as HTMLSpanElement).addEventListener('click',() => {

            console.log(`${index} - ${plugin.name}`);
            drawPluginSettings(index);


        });
    }
}

function drawPluginSettings(index){
    const grid = document.getElementById('plugin-settings-grid');
    const panel = document.getElementById('plugin-settings-panel');
    const sidebar = document.getElementById('plugin-settings-sidebar');
    const backButton = document.createElement('div');
    backButton.classList.add('sidebar-item');
    backButton.id = 'plugin-tab-back';
    backButton.innerHTML = `
        <span class="material-symbols-outlined sidebar-item-icon">
            undo
        </span>
        Back
    `;
    sidebar.innerHTML = '';
    sidebar.append(backButton);



    grid.classList.add('hidden');
    panel.classList.remove('hidden');
    window.plugin.getPluginConfig(index)
        .then((configBuilder: FSPlugin['info']['configBuilder']) => {
            console.log(configBuilder);
            for (const page of Object.keys(configBuilder.pages)){
                const button = document.createElement('div');
                button.classList.add('sidebar-item');
                button.id = `plugin-tab-${page}`;
                button.innerText = page;
                console.log(page);
                sidebar.append(button);
                button.addEventListener('click',() => {
                    const pageElements = configBuilder.pages[page];
                    for (const el of pageElements){
                        const elDiv = document.createElement('div');
                        

                        panel.append(elDiv);
                    }
                });
            }
        });
}


// if ((performance.getEntries()[0] as PerformanceNavigationTiming).type == 'reload') {
//     ipcRenderer.invoke('getPluginList')
//         .then(p => drawPlugins(p));
//     console.log('Reload');
// }
window.plugin.pluginList()
    .then(p => drawPlugins(p));


// .forEach((el: HTMLElement) => {
//     el.addEventListener('click',(e) => {
//         console.log(e.target);
//     });
// });