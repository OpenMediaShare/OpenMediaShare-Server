## JSON keys and values

| key     | value             | desc                                                                                 |
| ------- | ----------------- | ------------------------------------------------------------------------------------ |
| theme   | [[#(enum) theme]] | The current theme of the app.                                                        |
| mode    | [[#(enum) mode]]  | The current active service the app is listening for.                                 |
| showTTY | boolean           | If the app should output to the terminal. * Not currently implemented                |
| errNote | boolean           | If the app should create system notifications on errors. * Not currently implemented |

### Full JSON Object
```json
{
    "theme": "neonDark",
    "mode": "ytmusic",
    "showTTY": true,
    "errNote": true
}
```

#### (enum) mode
* ytmusic
* spotify
* youtube
* tiktok * not supported at this time
* applemusic


#### (enum) theme
* flatLight
* flatDark
* neonDark
* neonLight
* winAcrylic * only support on windows
* ipodClassic
