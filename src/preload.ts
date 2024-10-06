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

ipcRenderer.on('clientUpdate', (event, data: Client[]) => {
    console.log(data);
    document.getElementById('clients-table').innerHTML = '';
    const header = document.createElement('tr');
    header.innerHTML = `                        <th>Image</th>
                        <th>State</th>
                        <th>Name</th>
                        <th>Current Song</th>
                        <th>Service</th>
                        <th>IP</th>
                        <th class="home-page-table-uuid">UUID</th>`;
    document.getElementById('clients-table').append(header);
    data.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
<td class="home-page-table-image">
    <div class="home-page-table-image-center">
        <img src="${client.clientInfo.thumbnail}" height=64px>
    </div>
</td>
<td class="home-page-table-status">
    <div class="home-page-table-image-center">
        <span class="material-symbols-outlined home-page-table-status-icon">
            play_arrow
        </span>
    </div>
</td>
<td>${client.name}</td>
<td>${client.clientInfo.title}</br>${client.clientInfo.creator}</td>
<td>${client.service}</td>
<td>${client.ip}</td>
<td class="home-page-table-uuid">${client.uuid}</td>
                        `;
        document.getElementById('clients-table').append(row);

    });
});

const settings = {
    'pageName': {
        title: 'Something :3',
        elements: [
            {'type': 'checkbox', 'id': 'update_led','label': 'Update LED\'s'}
        ]
    }
};





