console.log('[WatchRPC] Loaded Background Script');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'exportFetch':
        // eslint-disable-next-line no-case-declarations
            const sendResponseClone = sendResponse;
            fetch(message.fetch.url, {
                method: message.fetch.method,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: message.fetch.body,
            })
                .then(async (_response) => {
                    return _response.json();
                })
                .then((data) => {
                    console.log(data);
                    sendResponseClone(data);
                });

            return true;
    }
});
