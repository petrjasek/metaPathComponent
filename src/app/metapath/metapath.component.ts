import {AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {SwiperConfigInterface} from 'ngx-swiper-wrapper';

@Component({
  selector: 'meta-path',
  templateUrl: './metapath.component.html',
  styleUrls: ['./metapath.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class MetapathComponent implements OnInit {

  @Input()
  public playeranim: string;


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

  public points = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

  //public points = [1, 2, 3, 4, 5];

  public path = [];
  private lastItemX = 0;
  private timer;
  private walkingSpeed = 300;
  private isWalking = 0;

  smooth = 10;
  stepSmoothDelta = 3;
  halfYOffset = 384;
  halfYOffsetsLess = [-1, 50, 70, 80, 50, -0, 0, -90, -100, -100, -100];

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
    // prevent wrong index
    if (this.currentNodeIndex >= this.points.length) {
      this.currentNodeIndex = this.points.length - 1;
    }
  }

  ngOnInit() {
    this.Resize(window.innerWidth, window.innerHeight);
    console.log(this.playeranim);
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

    // reset path
    this.path = [];

    // adjust startoffset for small amont of points to adjust horizontal centering shorter curves
    const area = (this.points.length - 1) * this.pathPointsSpace;
    if (area < this.minWidth) {
      const offset = (this.minWidth - area) / 2;
      this.pathStartOffset = offset;
      this.pathEndOffset = offset;
    }


    // set new half offset for centering different curves
    this.halfYOffset = this.minHeight / 2 - 160;
    if (this.points.length <= 10) {
      this.halfYOffset = this.minHeight / 2 + this.halfYOffsetsLess[this.points.length];
    }

    // adjust size of svg
    this.cWidth = this.pathStartOffset + this.pathEndOffset + ((this.points.length - 1) * this.pathPointsSpace);

    let localPathString = '';
    for (let i = 0; i < this.points.length; i++) {
      const __ret = this.buildPoint(i);

      this.path.push(__ret);

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

    console.dir(this.path);
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

  getPlayerPosition(idx) {
    return {
      x: this.path[idx].x,
      y: this.path[idx].y
    };
  }

  getPlayerGroupTransform(idx, dir) {
    const pos = this.getPlayerPosition(idx);
    let css = 'translate(' + (pos.x - 150) + ',' + (pos.y - 250) + ')';

    if (dir < 0) {
      css = 'translate(' + (pos.x + 150) + ',' + (pos.y - 250) + ')  scale(-1, 1)';
    }

    return css;
  }


  goToPoint(dir) {
    const newIndex = this.currentNodeIndex + dir;
    if (newIndex >= 0 && newIndex < this.points.length) {
      this.currentNodeIndex = newIndex;
    }
  }

  movePlayerTo(dir, targetIdx) {
    this.isWalking = dir;
    this.timer = setInterval(() => {
      this.currentNodeIndex = this.currentNodeIndex + dir;
      if (this.currentNodeIndex === targetIdx) {
        this.isWalking = 0;
        clearInterval(this.timer);
        this.gotoUrl();
      }
    }, this.walkingSpeed);
  }

  public nodeClick(idx) {

    let dir = 1;
    if (idx < this.currentNodeIndex) {
      dir = -1;
    }

    this.movePlayerTo(dir, idx);

    console.log('nodeClick' + idx);
  }

  public gotoUrl() {
    console.log('gotoUrl');
  }

}
