/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
    packagerConfig: {
        'icon': './build/YTlogo4.ico',
        'name': 'OpenMediaShare',
        'ignore': [
            'src',
            'docs',
            'out',
            '.vscode',
            '.github',
            '.gitignore',
            'eslintrc.json',
            'build',
            'TODO',
            'tsconfig.json',
            'forge.config.js'
        ]
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                'setupIcon': path.resolve(__dirname, 'build', 'YTlogo4.ico'),
                'loadingGif': 'build/loading.gif',
                'skipUpdateIcon': true
            },
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin', 'win32']
        },
        {
            name: '@electron-forge/maker-deb',
            platforms: ['linux']
        },
        {
            name: '@electron-forge/maker-rpm',
            platforms: ['linux']
        },
    ],
};
