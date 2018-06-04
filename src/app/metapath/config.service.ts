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


  hasOutline(): boolean {
    if (this.config.path.outline) {
      return true;
    }
    return false;
  }
}
