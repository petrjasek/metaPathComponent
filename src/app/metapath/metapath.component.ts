import {AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {SwiperConfigInterface} from 'ngx-swiper-wrapper';
import {Cookie} from 'ng2-cookies';

@Component({
  selector: 'meta-path',
  templateUrl: './metapath.component.html',
  styleUrls: ['./metapath.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class MetapathComponent implements OnInit, AfterViewInit {

  @Input()
  public playeranim: string;

  @Input()
  public bgimage: string;


  @ViewChild('container') container: ElementRef;
  @ViewChild('swiperWrapper') public swiperWrapper: any;
  @ViewChild('player') public player: ElementRef;

  cookies: Object;
  private cookieName = 'meta_quiz';

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

  public points = [];
  public path = [];
  private lastItemX = 0;
  private timer;
  private walkingSpeed = 200;
  private isWalking = 0;

  private swiperInstance: any = null;
  private contentWidth = 0;

  smooth = 10;
  stepSmoothDelta = 3;
  halfYOffset = 384;
  halfYOffsetsLess = [-1, 50, 70, 80, 50, -0, 0, -90, -100, -100, -100];

  pathPointsSpace = 100;
  pathStartOffset = 100;
  pathEndOffset = 100;

  amplitudeY = 205;

  pathString = '';

  currentNodeIndex = 1;

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
    this.cookies = Cookie.get(this.cookieName);
  }

  ngOnInit() {

    console.log('hey');
    console.log(window['pathpoints']);

    if (window['pathpoints']) {
      this.points = window['pathpoints'];
    } else {
      console.error('You need define pathpoints array');
    }

    if (this.currentNodeIndex >= this.points.length) {
      this.currentNodeIndex = this.points.length - 1;
    }

    // refresh from cookie
    if (this.cookies) {
      console.log('mam cookinu: ' + this.cookies);
      let cookieValue = +this.cookies * 1;
      if (cookieValue >= this.points.length) {
        cookieValue = this.points.length - 1;
      }
      this.currentNodeIndex = cookieValue;
    }

    this.Resize(window.innerWidth, window.innerHeight);
    this.buildPath();

  }

  ngAfterViewInit(): void {


    this.swiperInstance = this.swiperWrapper.directiveRef.instance;
    this.contentWidth = this.swiperWrapper.directiveRef.elementRef.nativeElement.clientWidth;


    this.setViewToPlayerPosition();
    this.getHtmlScale();
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
    console.log(this.points.length);

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
        localPathString = localPathString + 'M' + (__ret.x - this.pathStartOffset) + ',' + __ret.y + ' ';
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

  getPlayerPosition(idx, ratio = 1) {
    return {
      x: this.path[idx].x * ratio,
      y: this.path[idx].y * ratio
    };
  }

  getHtmlScale() {
    let ratio = this.containerWidth / this.minWidth * 0.75;
    if (ratio > 1) {
      ratio = 1;
    }
    const css = 'scale(' + (ratio) + ')';
    return css;
  }

  getHtmlPlayerGroupTransform(idx, dir) {

    const ratio = this.containerWidth / this.minWidth;
    const pos = this.getPlayerPosition(idx, ratio);
    let css = 'translate(' + (pos.x) + 'px,' + (pos.y) + 'px)';

    if (dir < 0) {
      css = 'translate(' + (pos.x) + 'px,' + (pos.y) + 'px)';
    }

    return css;
  }

  translateSwiper(offset) {
    if (this.swiperInstance) {
      this.swiperInstance.setTranslate(offset, 0);
    }
  }

  goToPoint(dir) {
    const newIndex = this.currentNodeIndex + dir;
    if (newIndex >= 0 && newIndex < this.points.length) {
      this.currentNodeIndex = newIndex;
    }
  }

  setViewToPlayerPosition() {
    // set view to player posiotion
    const ppos = this.getPlayerPosition(this.currentNodeIndex);
    const numberOfScreens = ppos.x / this.minWidth;
    if (ppos.x > this.minWidth) {
      const scroolOffset = (this.minWidth * numberOfScreens);
      this.translateSwiper(-scroolOffset);
    }
  }

  movePlayerTo(dir, targetIdx) {
    this.isWalking = dir;
    this.timer = setInterval(() => {
      this.currentNodeIndex = this.currentNodeIndex + dir;

      if (this.currentNodeIndex === targetIdx) {
        this.isWalking = 0;
        clearInterval(this.timer);
        Cookie.set(this.cookieName, this.currentNodeIndex.toString());
        this.gotoUrl(this.currentNodeIndex);
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

  public gotoUrl(idx) {

    const url = this.points[idx].url;
    console.log('gotoUrl: ' + url);

  }

}
