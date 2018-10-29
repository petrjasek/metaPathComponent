import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {SwiperConfigInterface} from 'ngx-swiper-wrapper';
import {Cookie} from 'ng2-cookies';
import {ConfigService} from './config.service';
import {DOCUMENT} from '@angular/common';

@Component({
    selector: 'meta-path',
    templateUrl: './metapath.component.html',
    styleUrls: ['./metapath.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class MetapathComponent implements OnInit, AfterViewInit {

    @Input()
    public config = null;

    @Input() redirect = true;

    @Input() startindex = 0;

    // assets
    public playeranim: string;
    public bgimage: string;
    public pathcolor = 'green';

    // pin colors
    public nextPinColor = 'darkgreen';
    public previousPinColor = 'lightgreen';
    public currentPinColor = 'orange';

    public redirectTimeout = 500;

    @ViewChild('container') private container: ElementRef;
    @ViewChild('swiperWrapper') private swiperWrapper: any;
    private swiperInstance: any = null;

    private cs: ConfigService;
    public points = [];
    public path = [];

    // cookies
    private cookies: Object;
    private cookieName = 'meta_quiz';


    public pathOutline = null;
    private walkingSpeed = 200;

    // force show help
    private helpVisible = false;

    // states
    private currentNodeIndex = 1;
    private updating = false;
    private isWalking = 0;

    // size
    containerWidth = 1024;
    containerHeight = 768;
    private ratio = 0.75;
    private minWidth = 1024;
    private minHeight = 768;
    private keepMinSize = true;

    // calculations
    private svgContentWidth = 2000;
    private swiperWidth = 0;

    // helpers
    private lastItemX = 0;
    private timer;
    private svgPathString = '';

    // path generation params
    private smooth = 10;
    private stepSmoothDelta = 3;
    private halfYPosition;

    private halfYOffset = -50;

    private halfYOffsetsLess = [-1, 50, 70, 80, 50, -0, 0, -90, -100, -100, -100];
    private pathPointsSpace = 100;
    private pathStartOffset = 100;
    private pathEndOffset = 100;
    private amplitudeY = 200;


    public swipe_config: SwiperConfigInterface = {
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

    constructor(private cconf: ConfigService, @Inject(DOCUMENT) private document: any) {
        this.cs = cconf;
        this.cookies = Cookie.get(this.cookieName);
    }

    ngOnInit() {

        this.cs.setConfig(this.config);

        this.points = this.cs.config.pathpoints;
        this.pathcolor = this.cs.config.path.color;
        this.nextPinColor = this.cs.config.path.pinNext;
        this.previousPinColor = this.cs.config.path.pinPrev;
        this.currentPinColor = this.cs.config.path.pinCurrent;
        this.bgimage = this.cs.config.backgroundImageUrl;
        this.playeranim = this.cs.config.playerAnimationUrl;

        if (this.cs.hasOutline()) {
            this.pathOutline = this.cs.config.path.outline;
        }

        // get last index from cookie
        // this.loadIndexFromCookie();

        const idx = Number(this.startindex);
        this.currentNodeIndex = idx;

        this.fixIndex();

        this.Resize(window.innerWidth, window.innerHeight);
        this.buildPath();
    }


    ngAfterViewInit(): void {
        this.swiperInstance = this.swiperWrapper.directiveRef.instance;
        this.swiperWidth = this.swiperWrapper.directiveRef.elementRef.nativeElement.clientWidth;
        this.setViewToPlayerPosition();
        this.setScaleTransform();
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

    private fixIndex() {
        // prevent high index
        if (this.currentNodeIndex >= this.points.length) {
            this.currentNodeIndex = this.points.length - 1;
        }
        if (this.currentNodeIndex < 0) {
            this.currentNodeIndex = 0;
        }
    }

    private loadIndexFromCookie() {
        // refresh from cookie
        if (this.cookies) {
            let cookieValue = +this.cookies * 1;
            if (cookieValue >= this.points.length) {
                cookieValue = this.points.length - 1;
            }
            this.currentNodeIndex = cookieValue;
        }
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
        this.halfYPosition = this.minHeight / 2 - this.halfYOffset;
        if (this.points.length <= 10) {
            this.halfYPosition = this.minHeight / 2 + this.halfYOffsetsLess[this.points.length];
        }

        // adjust size of svg
        this.svgContentWidth = this.pathStartOffset + this.pathEndOffset + ((this.points.length - 1) * this.pathPointsSpace);

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
            this.svgPathString = localPathString;
        }

    }

    private buildPoint(i: number) {
        //  x
        const x = (i * this.pathPointsSpace) + this.pathStartOffset;
        //  y
        const helpx = ((i / this.smooth) * this.stepSmoothDelta);
        const y = -1 * (Math.cos(helpx) * this.amplitudeY) + this.halfYPosition;
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
        const y = -1 * (Math.cos(x) * this.amplitudeY) + this.halfYPosition;
        return y;
    }

    pathPointClass(idx) {
        if (idx < this.currentNodeIndex) {
            return 'node-done';
        }

        if (idx === this.currentNodeIndex) {
            return 'node-current';
        }

        return 'node-next';
    }

    pathPointStyle(idx) {
        if (idx < this.currentNodeIndex) {
            return this.previousPinColor;
        }
        if (idx === this.currentNodeIndex) {
            return this.currentPinColor;
        }
        return this.nextPinColor;
    }

    getPlayerPosition(idx, ratio = 1) {
        return {
            x: this.path[idx].x * ratio,
            y: this.path[idx].y * ratio
        };
    }

    setScaleTransform() {
        let ratio = this.containerWidth / this.minWidth * 0.75;
        if (ratio > 1) {
            ratio = 1;
        }
        const css = 'scale(' + (ratio) + ')';
        return css;
    }

    getPlayerTransform(idx, dir) {

        const ratio = this.containerWidth / this.minWidth;
        const pos = this.getPlayerPosition(idx, ratio);
        let css = 'translate(' + (pos.x) + 'px,' + (pos.y) + 'px)';

        if (dir < 0) {
            css = 'translate(' + (pos.x) + 'px,' + (pos.y) + 'px)';
        }

        return css;
    }


    getLayerRatioTransform() {
        const ratio = this.containerWidth / this.minWidth;
        const scaleRatio = ratio;
        const css = 'scale(' + (scaleRatio) + ',' + (scaleRatio) + ')';
        return css;
    }


    translateSwiper(offset) {
        if (this.swiperInstance) {
            this.swiperInstance.setTranslate(offset, 0);
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

    goToPoint(dir) {
        const newIndex = this.currentNodeIndex + dir;
        if (newIndex >= 0 && newIndex < this.points.length) {
            this.movePlayerTo(dir, newIndex);
        }
    }

    movePlayerTo(dir, targetIdx) {
        if (!this.isWalking) {

            this.isWalking = dir;
            this.timer = setInterval(() => {
                this.currentNodeIndex = this.currentNodeIndex + dir;

                if (this.currentNodeIndex === targetIdx) {
                    this.isWalking = 0;
                    clearInterval(this.timer);
                    Cookie.set(this.cookieName, this.currentNodeIndex.toString());
                    this.gotoUrl(this.currentNodeIndex);

// //                    this.setViewToPlayerPosition();
//                     const xoffs = this.swiperInstance.getTranslate('x');
//                     // console.dir(xoffs);
//
//
//                     const xmax = xoffs + this.containerWidth;
//                     const pPos = this.getPlayerPosition(this.currentNodeIndex).x * this.ratio;
//
//                     console.log(xoffs);
//                     console.log(xmax);
//                     console.log(pPos);

                    // if(pPos > xmax) {
                    //    this.swiperInstance.setTranslate(xoffs - 100);
                    // }

                }
            }, this.walkingSpeed);
        }
    }

    public nodeClick(idx) {
        let dir = 1;
        if (idx < this.currentNodeIndex) {
            dir = -1;
        }
        this.movePlayerTo(dir, idx);
    }

    public toggleHelp() {
        this.helpVisible = !this.helpVisible;
    }

    public gotoUrl(idx) {
        const url = this.points[idx].url;
        if (this.redirect === true || this.redirect === 'true') {
            setTimeout(function () {
                this.document.location.href = url;
            }, this.redirectTimeout);
        } else {
            console.warn('redirect=false - debug target url: ' + url);
        }
    }

    public getAnimClass(animtype: string = 'none') {

        return 'layer-anim-' + animtype;
    }

    public setLayerTranslateY(layer) {
        let pos = 0;
        if (layer.position) {
            pos = layer.position.y;
        }
        return (pos);
    }

    public setLayerTranslateX(layer) {
        let pos = 0;
        if (layer.position) {
            pos = layer.position.x;
        }
        return (pos);
    }

    public setLayerSpriteAnim(layer) {
        let css = 'layer-sprite-anim-none';
        if (layer.spriteanim) {
            css = 'layer-sprite-anim-step';
        }
        return (css);
    }

}
