import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root',
})

export class ConfigService {

    public config = null;

    constructor() {
    }

    public setConfig(configVariableName) {
        if (!window[configVariableName]) {
            console.error('missing config');
        }
        this.config = window[configVariableName];
    }

    public logConfig() {
        console.dir(this.config);
    }

    getId(): string {
        return this.config.pathId;
    }

    getLayers() {
        return this.config.layers;
    }

    getLayer(idx) {
        return this.config.layers[idx];
    }

    getNextScreen() {
        return this.config.nextScreenUrl;
    }

    getPrevScreen() {
        return this.config.prevScreenUrl;
    }

    helpEnabled() {
        if (!this.config.help || !this.config.help.enabled) {
            return false;
        }
        return true;
    }
    getHelp() {
        if (!this.config.help || !this.config.help.enabled) {
            return null;
        }
        return this.config.help;
    }


    hasOutline(): boolean {
        if (this.config.path.outline) {
            return true;
        }
        return false;
    }
}
