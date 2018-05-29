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
  public minHeight = 1024;
  public keepMinSize = false;

  public cWidth = 2000;
  public circle = [200, 384];

  public points = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14];
  //public points = [1, 2, 3, 4];

  private lastItemX = 0;
  smooth = 10;
  stepSmoothDelta = 3;
  halfYOffset = 384;

  pathPointsSpace = 100;
  pathStartOffset = 100;
  pathEndOffset = 100;

  amplitudeY = 205;

  pathString = '';

  currentNodeIndex = 5;

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


    this.buildPath();
    // console.dir(this.swiperWrapper.directiveRef);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.Resize(event.target.innerWidth, event.target.innerHeight);
  }

  public Resize(winW, winH) {
    if (!this.updating) {
      this.updating = true;

      if (this.keepMinSize) {
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
      } else {
        const newHeight = winW * this.ratio;
        this.containerWidth = winW;
        this.containerHeight = Math.round(newHeight);
      }

      this.Update();

    }
  }

  public Update() {
    setTimeout(() => {
      this.swiperWrapper.directiveRef.update(true);
      this.updating = false;
    }, 100);
  }

  public onIndexChange(index: number): void {
  }

  public buildPath() {

    // adjust startoffset for small amont of points to adjust horizontal centering shorter curves
    const area = (this.points.length - 1) * this.pathPointsSpace;
    if (area < this.minWidth) {
      const offset = (this.minWidth - area) / 2;
      this.pathStartOffset = offset;
      this.pathEndOffset = offset;
    }

    // calc min,max Y for vertical center
    let minY = this.minHeight;
    let maxY = 0;
    for (let i = 0; i < this.points.length; i++) {
      const dx = (((i) / this.smooth) * this.stepSmoothDelta);
      const dy = -1 * (Math.cos(dx) * this.amplitudeY);
      minY = Math.min(minY, dy);
      maxY = Math.max(minY, dy);
    }
    // set new half offset for centering different curves
    this.halfYOffset = this.minHeight / 2 - Math.abs(maxY - minY) / 2 + 60;

    // adjust size of svg
    this.cWidth = this.pathStartOffset + this.pathEndOffset + ((this.points.length - 1) * this.pathPointsSpace);

    let localPathString = '';
    for (let i = 0; i < this.points.length; i++) {
      const __ret = this.buildPoint(i);

      if (i <= 0) {
        localPathString = localPathString + 'M' + (__ret.x - this.pathStartOffset) + ',' + __ret.y + ', ';
      }
      localPathString = localPathString + __ret.svgCurve + __ret.x + ',' + __ret.y + ', ';
      if (i === this.points.length - 1) {
        localPathString = localPathString + 'L' + (__ret.x + this.pathEndOffset) + ',' + __ret.y + ', ';
      }
      // clean end coma (FF issue)
      localPathString = localPathString.substr(0, localPathString.length - 2);
      this.pathString = localPathString;
    }
  }

  private buildPoint(i: number) {
    //  x
    const x = (i * this.pathPointsSpace) + this.pathStartOffset;
    //  y
    const helpx = ((i / this.smooth) * this.stepSmoothDelta);
    const y = -1 * (Math.cos(helpx) * this.amplitudeY) + this.halfYOffset;
    const svgCurve = 'L';
    return {x, y, svgCurve};
  }

  getPosX(idx) {
    const tx = (idx * this.pathPointsSpace) + this.pathStartOffset;
    this.lastItemX = tx;
    return this.lastItemX;
  }

  getPosY(idx) {
    const x = (((idx) / this.smooth) * this.stepSmoothDelta);
    const y = -1 * (Math.cos(x) * this.amplitudeY) + this.halfYOffset;
    return y;
  }

  getNodeClass(idx) {
    if (idx < this.currentNodeIndex) {
      return 'node-done';
    }

    if (idx === this.currentNodeIndex) {
      return 'node-current';
    }

    return 'node-next';
  }

  goToPoint(dir) {
    const newIndex = this.currentNodeIndex + dir;
    if (newIndex >= 0 && newIndex < this.points.length) {
      this.currentNodeIndex = newIndex;
    }
  }

  public nodeClick(idx) {
    if (idx === this.currentNodeIndex) {
      this.goToPoint(+1);
    }
    console.log('nodeClick' + idx);
  }

}
