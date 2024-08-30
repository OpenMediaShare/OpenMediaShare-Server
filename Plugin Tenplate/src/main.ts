import { defaultModules } from './index';
export const info = {
    name: 'testPlugin',
    auther: 'WaterWolf5918'
}

export const start = function(modules: defaultModules){
    console.log('Hello World!')
    console.log(`this plugin was created by ${this.info.auther}`)
}

export const stop = function(){
    console.log('Goodbye World!')
}