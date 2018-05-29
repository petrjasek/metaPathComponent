import {Component, OnInit, ViewEncapsulation, ElementRef, Input} from '@angular/core';
import {Cookie} from 'ng2-cookies';

@Component({
  templateUrl: './user-pool.component.html',
  styleUrls: ['./user-pool.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class UserPoolComponent implements OnInit {

  @Input()
  public index: number;

  @Input()
  public bgurl: string;

  @Input()
  public bgcolor: string;

  @Input()
  public aspectx: number;

  @Input()
  public aspecty: number;


  cookies: Object;

  pathPoints = [];

  imagerotation = 10;

  smooth = 10;
  stepSmoothDelta = 3;
  stepXDelta = 60;

  amplitudeY = 205;
  halfYOffset = 100;
  stepsOnScreen = 10.5;
  enableOverlay = false;
  enableForeground = true;

  playerX = 100;
  playerY = 100;

  private width = 1024;
  private height = 768;

  private lastItemX: number;

  constructor(el: ElementRef) {
    console.log(el);
    // console.dir(Cookie.getAll());
    this.cookies = Cookie.get('quiz_progress');

  }

  ngOnInit() {

    //this.pathPoints = new Array(40).fill(1);

    this.recalcSize();

    if (window['pathpoints']) {
      this.pathPoints = window['pathpoints'];
      console.log(window['pathpoints']);
    }
    if (!this.index) {
      this.index = 0;
    } else {
      this.index = this.index * 1;
    }

    if (this.cookies) {
      console.log('mam cookinu' + this.cookies);
      this.index = +this.cookies * 1;
    }

    this.halfYOffset = ((this.aspecty * .7) / 2);
    this.stepXDelta = Math.floor(this.aspectx / this.stepsOnScreen);

  }

  recalcSize() {
    console.log(window.innerWidth);

    this.width = this.aspectx;
    this.height = this.aspecty;
  }


  getPosX(idx) {
    const tx = idx * this.stepXDelta;
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

    if (idx == this.index) {
      this.playerX = tx;
    }

    return this.lastItemX;
  }

  getPosY(idx) {
    const x = ((idx / this.smooth) * this.stepSmoothDelta);
    const y = -1 * (Math.cos(x) * this.amplitudeY) + this.halfYOffset;

    if (idx == this.index) {
      this.playerY = y;
    }

    return y;
  }


  getPointClass(step) {

    let itemclass = '';

    if (this.pathPoints[step].type === 'test') {
      itemclass = itemclass + 'point-test ';
    } else {
      itemclass = itemclass + 'point-default ';
    }

    if (step < this.index) {
      itemclass = itemclass + 'path-item-done';
    }

    if (step == this.index) {
      itemclass = itemclass + 'path-item-last';
    }

    if (step > this.index) {
      itemclass = itemclass + 'path-item-next';
    }
    return itemclass;

  }

  nextStep(goto: boolean = false) {
    this.index = (this.index * 1) + 1;

    Cookie.set('quiz_progress', this.index.toString());

    if (goto) {
      console.log('gotu url: ' + this.pathPoints[this.index].url);
    }
    console.log(this.index);
  }

  prevStep() {
    this.index = (this.index * 1) - 1;

    Cookie.set('quiz_progress', this.index.toString());

    console.log(this.index);
  }

}
