At start up the app starts listening on port 9494.
Web server listens on port 9494 for data from the restAPI and listens to a WebSocket connection that sends current data every 5 seconds.

### Start up process

1. Electron on ready
	create main window
2. DiscordRPC on ready 
	set discord activity to {details: "Waiting For REST API",largeImageKey: "ytlogo4"}
3. DiscordRPC on login 
	create web server to handle restAPI and WebSocket's 

