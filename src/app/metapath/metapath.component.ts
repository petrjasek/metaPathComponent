import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {SwiperConfigInterface} from 'ngx-swiper-wrapper';

@Component({
  selector: 'meta-path',
  templateUrl: './metapath.component.html',
  styleUrls: ['./metapath.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class MetapathComponent implements OnInit {

  @ViewChild('container') container: ElementRef;
  @ViewChild('swiperWrapper') public swiperWrapper: any;


  private el: ElementRef;
  private wrapper: ElementRef;
  private updating = false;

  public containerWidth = 1024;
  public containerHeight = 768;
  public ratio = 0.75;
  public minWidth = 1024;

  public cWidth = 2000;
  public circle = [200, 400];
  public points = [1, 2, 3, 4, 5];

  private lastItemX = 0;


  public config: SwiperConfigInterface = {
    direction: 'horizontal',
    freeMode: true,
    slidesPerView: 'auto',
    centeredSlides: false,
    keyboard: false,
    mousewheel: true,
    scrollbar: false,
    navigation: false,
    pagination: false
  };

  constructor() {
  }

  ngOnInit() {
    this.Resize(window.innerWidth, window.innerHeight);
    // console.dir(this.swiperWrapper.directiveRef);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.Resize(event.target.innerWidth, event.target.innerHeight);
  }

  public Resize(winW, winH) {
    if (!this.updating) {
      this.updating = true;

      let width = winW;
      if (winW < this.minWidth) {
        width = this.minWidth;
      }

      const newHeight = width * this.ratio;

      if (newHeight <= winH) {
        this.containerWidth = width;
        this.containerHeight = Math.round(newHeight);
        this.Update();
      } else {
        this.containerHeight = winH;
        this.containerWidth = Math.round(winH * 1.33);
      }

      this.Update();

    }
  }

  public Update() {
    setTimeout(() => {
      this.swiperWrapper.directiveRef.update(true);
      console.log('swupd');
      this.updating = false;
    }, 100);
  }

  public onIndexChange(index: number): void {
  }

  getPosX(idx) {
    const tx = (idx * 100) + 300;
    const compensator = 0;
    // if (idx > 40) {
    //   compensator = 2;
    // }
    // if (idx > 52) {
    //   compensator = 6;
    // }
    // if (idx > 73) {
    //   compensator = 8;
    // }
    this.lastItemX = tx + compensator;


    return this.lastItemX;
  }
}
