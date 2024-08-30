# Building the Extension

If in the event you want to build the extension from source, follow the steps for the different operating systems.

## Windows 10/11 (64-bit)

The following steps are for Windows 10/11 (64-bit). Note that it has not been build the extension from tested on 32-bit platforms, so tread carefully.

### Required Tools

* NodeJS 19.3.0 (technically any 19.X.X version should work)
* NPM 9.6.4
* TypeScript 4.9.5

### Steps

1. Make sure you're in the directory containing the code
2. Run `npm i`
3. Run `npm run build`
4. Compress `dist`, `static`, and `manifest.json` into a compressed zip file