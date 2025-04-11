// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// eslint-disable-next-line @typescript-eslint/no-unused-vars, prefer-const
const providerTenplate = document.getElementById('provider-tenplate');
const providerTable = document.getElementById('provider-table');

const settingsToggleTenplate = document.getElementById('settings-toggle-tenplate');

const config = {
    showIPS: false,
    showUUIDS: false,
};

let clients: Client[] = [];

for(const el of document.getElementsByClassName('sidebar-button')) {
    el.addEventListener('click', (e) => {
        // el.id should always be equal to the the first section of the page
        // it corresponds to

        const lastActive    = document.querySelector('.active-sidebar-button') as HTMLDivElement;
        const newActive     = document.getElementById(el.id);

        if(lastActive.id == newActive.id) return;

        const lastActivePage = document.querySelector('.active-page');
        const newActivePage = document.getElementById(`${el.id}-content`);

        lastActive.classList.remove('active-sidebar-button');
        newActive.classList.add('active-sidebar-button');

        lastActivePage.classList.remove('active-page');
        newActivePage.classList.add('active-page');
    });
}

loadWebSettings();
renderSettings();

window.callbacks.clientUpdate((_clients) => {
    if (clients.length == 0) {
        console.log('No Presaved Clients. Full Render');
        console.log(_clients);
        clients = _clients;
        clients.forEach(client => drawNewClient(client));
        return;
    }
    console.log('Using cached clients.');



    const clientsUUID = clients.map(c => c.uuid);
    const _clientsUUID = _clients.map(c => c.uuid);

    const sameClients = clients.filter(c => _clients.map(c => c.uuid).includes(c.uuid));
    const newClients = _clients.filter(c => !clients.map(c => c.uuid).includes(c.uuid));
    const removedClients = clients.filter(c => !_clients.map(c => c.uuid).includes(c.uuid));


    if (newClients.length == 0 && removedClients.length == 0) {
        // console.log('No clients changed, updateing existing clients.');
        // console.log(`Same Clients: ${sameClients.map(c => c.uuid).join(', ')}`);
        for (const client of sameClients) {
            updateExistingClient(client);
        }

    } else if (newClients.length > 0 && removedClients.length == 0) {
        // console.log('New clients detected, adding client nodes to table.');
        // console.log(`New Clients: ${newClients.map(c => c.uuid).join(', ')}`);
        for (const client of newClients) {
            drawNewClient(client);
        }
    } else if (newClients.length == 0 && removedClients.length > 0){
        // console.log('Clients removed, removing client nodes from table.');
        // console.log(`Removed Clients: ${removedClients.map(c => c.uuid).join(', ')}`);
        for (const client of removedClients) {
            removeClient(client);
        }
    }

    clients = _clients;
});

function getStateIcon(playerState: PlayerState) {
    switch (playerState) {
        case 'playing':
            return 'play_arrow';
            break;
        case 'paused':
            return 'pause';
            break;
        case 'unknown':
            return 'question_mark';
            break;
    }
}



function removeClient(client: Client) {
    const el = providerTable.querySelector(`#u${client.uuid}`);
    if (el == null){
        console.error(`removeClient failed with error. ${client.uuid} was not found well trying to update it. Ignoring.`);
        return;
    }
    el.remove();
}

function updateExistingClient(client: Client) {
    const el = providerTable.querySelector(`#u${client.uuid}`);
    if (el == null){
        console.error(`UpdateExistingClient failed with error. ${client.uuid} was not found well trying to update it. Creating new element`);
        drawNewClient(client);
        return;
    }
    // [WaterWolf5918] Client name, service, and uuid should never change so we don't update them. 
    //     I swear if someone makes a provider that changes one of them I'm going to lose it. 

    // [WaterWolf5918] Update ip if it has changed. It shouldn't most of the time...
    const elIP = (el.querySelector('.provider-ip p') as HTMLParagraphElement);
    if (elIP.innerText !== client.ip) {elIP.innerText == client.ip;}
    // [WaterWolf5918] Only try to update it if the title has changed.
    const elTitle = (el.querySelector('.provider-current-title p') as HTMLParagraphElement);
    if (elTitle.innerText !== client.clientInfo.title) {
        (el.querySelector('.provider-image img')       as HTMLImageElement).src           = client.clientInfo.thumbnail ?? './YTlogo4.png' ;
        (el.querySelector('.provider-state span')      as HTMLSpanElement).innerText      = getStateIcon(client.clientInfo.playerState ?? 'unknown');
        (el.querySelector('.provider-current-title p') as HTMLParagraphElement).innerText = client.clientInfo.title;
    }
}


function drawNewClient(client: Client) {
    // [WaterWolf5918] Bandaid fix for Node not having methods it should in this case 
    const newEl = ((providerTenplate as HTMLTemplateElement).content.cloneNode(true) as DocumentFragment);
    newEl.querySelector('.provider').id = `u${client.uuid}`;
    (newEl.querySelector('.provider-image img')       as HTMLImageElement).src           = client.clientInfo.thumbnail ?? './YTlogo4.png' ;
    (newEl.querySelector('.provider-state span')      as HTMLSpanElement).innerText      = getStateIcon(client.clientInfo.playerState ?? 'unknown');
    (newEl.querySelector('.provider-name p')          as HTMLParagraphElement).innerText = client.name;
    (newEl.querySelector('.provider-current-title p') as HTMLParagraphElement).innerText = client.clientInfo.title;
    // [WaterWolf5918] Might be hidden in the future
    (newEl.querySelector('.provider-service p')       as HTMLParagraphElement).innerText = client.service; 
    //  [WaterWolf5918] Only shown if debugging is enabled 
    (newEl.querySelector('.provider-ip p')            as HTMLParagraphElement).innerText = client.ip;
    (newEl.querySelector('.provider-uuid p')          as HTMLParagraphElement).innerText = client.uuid;
    
    if (!config.showIPS) {
        (newEl.querySelector('.provider-ip')   as HTMLDivElement).classList.add('hidden');
    }
    if (!config.showUUIDS) {
        (newEl.querySelector('.provider-uuid') as HTMLDivElement).classList.add('hidden');
    }

    providerTable.appendChild(newEl);
}

async function loadWebSettings() {
    const showIPS = await window.settings.get('webDisplayIPs');
    const showUUIDS = await window.settings.get('webDisplayUUIDs');

    config.showIPS = showIPS;
    config.showUUIDS = showUUIDS;
    if (config.showIPS) {
        document.querySelectorAll('.provider-ip').forEach(el => el.classList.remove('hidden'));
    } else {
        document.querySelectorAll('.provider-ip').forEach(el => el.classList.add('hidden'));
    }
    if (config.showUUIDS) {
        document.querySelectorAll('.provider-uuid').forEach(el => el.classList.remove('hidden'));
    } else {
        document.querySelectorAll('.provider-uuid').forEach(el => el.classList.add('hidden'));
    }

}



async function renderSettings(){
    const settingsPage = document.getElementById('settings-content');
    const configBuilder = await window.settings.getBuilder();
    settingsPage.innerHTML = '';

    for (const page in configBuilder.pages) { 
        const el = document.createElement('p');
        el.classList.add('settings-category');
        el.innerText = page;
        settingsPage.appendChild(el);
        for (const setting of configBuilder.pages[page]){
            const value = await window.settings.get(setting.id);
            switch(setting.type) {
                case 'checkbox': {
                    const settingsEl = ((settingsToggleTenplate as HTMLTemplateElement).content.cloneNode(true) as DocumentFragment);
                    const toggle = settingsEl.querySelector('.toggle-swtich input[type="checkbox"]') as HTMLInputElement;
                    (settingsEl.querySelector('.settings-label') as HTMLParagraphElement).innerText = setting.displayName;
                    toggle.checked = (typeof value == 'boolean') ? value : false;
                    toggle.addEventListener('change',() => {
                        window.settings.set(setting.id,toggle.checked);
                        loadWebSettings();
                    });
                    settingsPage.appendChild(settingsEl);
                    break;
                }
            }

        }
    }
}


// const configSettings = [
//     {
//         type: 'boolean',
//         key: 'debug',
//         title: 'Enable Debugging Logs',
//         desc: 'Enables debug messages in the terminal and enables the debug ui on port 4949'
//     },
//     {
//         type: 'boolean',
//         key: 'debugNotification',
//         title: 'Enable Debugging Notification',
//         desc: 'Enables debug desktop notifications.'
//     }
// ];


// const settingsPage = document.querySelector('#settings-page .grid-container');
// configSettings.forEach(async (setting) => {
//     const checked = await window.settings.get(setting.key);
//     const el = document.createElement('div');
//     el.id = setting.key;
//     el.classList.add('plugin','settings-item');
//     const booleanHtml = 
//     `
//             <div class="plugin-details">
//                 <div class="plugin-topbar">
//                     <span class="plugin-title">
//                         ${setting.title ?? setting.key}
//                     </span>
//                     <label class="switch">
//                         <input id="${setting.key}-checkbox" type="checkbox" ${checked ? 'checked' : ''}>
//                         <span class="slider"></span>
//                     </label>
//                 </div>
//                 <span>${setting.desc ?? 'No Desc'}</span>
//             </div>

//     `;
    
//     el.innerHTML = booleanHtml;
//     settingsPage.appendChild(el);
//     document.getElementById(`${setting.key}-checkbox`).addEventListener('click',(e) => {
//         window.settings.set(setting.key,e.target.checked);
//         console.log(`${setting.key}:${e.target.checked}`);
//     });
// });

// function drawPlugins(plugins: FSPlugin['info'][]) {
//     const pluginPage = document.getElementById('plugin-settings-grid');
//     for (const [index,plugin] of plugins.entries()) {
//         console.log(plugin.name);
//         const html = `
//         <div class="plugin-details">
//             <div class="plugin-topbar">
//                 <span class="plugin-title">${plugin.name}</span>
//                 <span class="material-symbols-outlined">
//                     settings
//                 </span>
//                 <label class="switch">
//                     <input type="checkbox" checked=${plugin.isRunning}>
//                     <span class="slider"></span>
//                 </label>
//             </div>
//             <span class="plugin-author">By ${plugin.author}</span><br />
//             <span>${plugin.description ?? ''}</span>
//         </div>
//     `;
//         const pluginEl = document.createElement('div');
//         pluginEl.id = `${index}-plugin`;
//         pluginEl.classList.add('plugin');
//         pluginEl.innerHTML = html;
//         pluginPage.appendChild(pluginEl);

//         (pluginEl.querySelector('.material-symbols-outlined') as HTMLSpanElement).addEventListener('click',() => {

//             console.log(`${index} - ${plugin.name}`);
//             drawPluginSettings(index);


//         });
//     }
// }

// function drawPluginSettings(index){
//     const grid = document.getElementById('plugin-settings-grid');
//     const panel = document.getElementById('plugin-settings-panel');
//     const sidebar = document.getElementById('plugin-settings-sidebar');
//     const backButton = document.createElement('div');
//     backButton.classList.add('sidebar-item');
//     backButton.id = 'plugin-tab-back';
//     backButton.innerHTML = `
//         <span class="material-symbols-outlined sidebar-item-icon">
//             undo
//         </span>
//         Back
//     `;
//     sidebar.innerHTML = '';
//     sidebar.append(backButton);

//     grid.classList.add('hidden');
//     panel.classList.remove('hidden');
//     window.plugin.getPluginConfig(index)
//         .then((configBuilder: FSPlugin['info']['configBuilder']) => {
//             console.log(configBuilder);
//             for (const page of Object.keys(configBuilder.pages)){
//                 const button = document.createElement('div');
//                 button.classList.add('sidebar-item');
//                 button.id = `plugin-tab-${page}`;
//                 button.innerText = page;
//                 console.log(page);
//                 sidebar.append(button);
//                 button.addEventListener('click',() => {
//                     const pageElements = configBuilder.pages[page];
//                     for (const el of pageElements){
//                         const elDiv = document.createElement('div');
                    

//                         panel.append(elDiv);
//                     }
//                 });
//             }
//         });
// }


// window.plugin.pluginList()
//     .then(p => drawPlugins(p));
