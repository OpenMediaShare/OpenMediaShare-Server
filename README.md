# OpenMediaShare
A program built to manage playback[^2], and share playing media data to local running apps using a RestAPI and or Websockets[^1].

## Serivce Providers 
Service Proiders are anything that feeds media data into the program.
* WaterWolf5918/OpenMediaShare-Browser
* WaterWolf5918/OpenMediaShare-Spicetify
  
## Plugins 
> [!CAUTION]
> **Only install plugins from developers you trust.**
> 
> All plugins run with full nodeJS and electron access this means installing untrusted plugins can lead to your system being compromised!!!
> 
Plugins are javascript files containing code that runs at start up, shutdown, and on info updates.

List of trusted plugins 
* WaterWolf5918/VibeLight - Software to controll home assistant based lighting from thumbnail colors.
* WaterWolf5918/WatchRPC - DiscordRPC media share for any service.

[^1]: Websockets are not currently supported but are planned.
[^2]: Playback controlls are currently not support and will be service depended once added.
### Developers
> [!TIP]
> Look at the [wiki](https://github.com/WaterWolf5918/OpenMediaShare/wiki/) for documentation on stuff like the protocol.
