Every 5 seconds on all web socket connections a data packet is sent with the following data
```json
event: "setActivity",
app: app,
state: `By ${store.info.video.creator}`,
details: `${store.info.video.title} ${store.info.time.formattedTime}`,
largeImageKey: `${store.info.video.thumbnail}`,
smallImageKey: `ytlogo4`,
smallImageText: "WatchRPC Plugin",
largeImageText: `${store.info.time.formattedTime} | ${Math.round(store.info.time.timePercent)}%`,
```