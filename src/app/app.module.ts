import {BrowserModule} from '@angular/platform-browser';
import {Injector, NgModule} from '@angular/core';
import {AppComponent} from './app.component';

import {SwiperConfigInterface} from 'ngx-swiper-wrapper';
import {SwiperModule} from 'ngx-swiper-wrapper';
import {SWIPER_CONFIG} from 'ngx-swiper-wrapper';
import {createCustomElement} from '@angular/elements';

// import {UserPoolComponent} from './user-pool/user-pool.component';
import {MetapathComponent} from './metapath/metapath.component';

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  slidesPerView: 'auto'
};


@NgModule({
  declarations: [
    AppComponent,
    // UserPoolComponent,
    MetapathComponent
  ],
  imports: [
    SwiperModule,
    BrowserModule
  ],
  providers: [
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG
    }
  ],
  entryComponents: [
    // UserPoolComponent
    MetapathComponent
  ]
})
export class AppModule {

  constructor(private injector: Injector) {
  }

  ngDoBootstrap() {
    // const el = createCustomElement(UserPoolComponent, {injector: this.injector});
    const el = createCustomElement(MetapathComponent, {injector: this.injector});
    customElements.define('meta-path', el);
  }
}
