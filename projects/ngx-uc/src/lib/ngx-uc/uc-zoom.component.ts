import {AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, Renderer2} from '@angular/core';

export interface Coordinates {
  x: number,
  y: number
}

@Component({
  selector: 'img[uc-zoom]',
  exportAs: 'ucNgZoom',
  templateUrl: './uc-zoom.component.html',
  styleUrls: ['./uc-zoom.component.css']
})
export class ucZoomComponent implements OnInit, AfterViewInit {

  cx: number = 0;
  cy: number = 0;

  @Output()
  lensPosition = new EventEmitter<Coordinates>();

  private zoomResult!: HTMLDivElement;
  private lens!: HTMLDivElement;
  private isReady = false;

  constructor(private elRef:ElementRef,
              private renderer: Renderer2) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.wrapImage(this.elRef.nativeElement);
    this.initializeLensAndResult(this.elRef.nativeElement);
    this.isReady = true;
  }

  wrapImage(srcImg:HTMLImageElement):HTMLDivElement {
    const parent = this.renderer.parentNode(srcImg);
    const wrapperDiv = this.renderer.createElement('div');
    this.renderer.addClass(wrapperDiv, 'uc-img-container');
    this.renderer.insertBefore(parent, wrapperDiv, srcImg);
    this.renderer.removeChild(parent, srcImg, true);
    this.renderer.appendChild(wrapperDiv, srcImg);
    this.renderer.listen(srcImg, 'mousemove', event => {this.onImgMouseMove(event, srcImg)});
    this.renderer.listen(srcImg, 'mouseenter', event => {this.onImgMouseEnter(event)});

    return wrapperDiv;
  }

  initializeLensAndResult(srcImg:HTMLImageElement): void {
    this.zoomResult = this.createZoomResultContainer(srcImg);
    this.lens = this.creatLens(srcImg);

    /* Calculate the ratio between result DIV and lens: */
    this.cx = this.zoomResult.offsetWidth / this.lens.offsetWidth;
    this.cy = this.zoomResult.offsetHeight / this.lens.offsetHeight;

    const backGroundImage = `url('${srcImg.src}')`;
    this.renderer.setStyle(this.zoomResult, 'background-image', backGroundImage);
    const bw = srcImg.width * this.cx;
    const bh = srcImg.height * this.cy;
    this.renderer.setStyle(this.zoomResult, 'background-size', `${bw}px ${bh}px`);
    this.renderer.addClass(this.zoomResult, 'uc-hide-lens');
    this.renderer.addClass(this.lens, 'uc-hide-lens');
    this.renderer.listen(this.lens, 'mousemove', event => {this.onImgMouseMove(event, srcImg)});
    this.renderer.listen(this.lens, 'mouseleave', event => {this.onImgMouseLeave(event)});
  }

  creatLens(srcImg:HTMLImageElement):HTMLDivElement {
    const lens: HTMLDivElement = this.renderer.createElement('div');
    this.renderer.setProperty(lens, 'id', 'zoom-lens');
    this.renderer.addClass(lens, 'uc-img-zoom-lens');
    this.renderer.insertBefore(this.renderer.parentNode(srcImg), lens, srcImg);
    return lens;
  }

  createZoomResultContainer(srcImg:HTMLImageElement): HTMLDivElement {
    const zoomResult: HTMLDivElement = this.renderer.createElement('div');
    this.renderer.setProperty(zoomResult, 'id', 'zoom-result');
    this.renderer.addClass(zoomResult, 'uc-img-zoom-result');
    this.renderer.setStyle(zoomResult, 'left', `${srcImg.width}px`);
    this.renderer.appendChild(this.renderer.parentNode(srcImg), zoomResult);

    return zoomResult;
  }

  onImgMouseMove(event: MouseEvent, imgElement: HTMLImageElement | null = null): void {
    event.preventDefault();

    if (!this.isReady) return;

    const srcImg = imgElement? imgElement : event.target as HTMLImageElement;

    /* Get the cursor's x and y positions: */
    const pos = ucZoomComponent.getCursorPosition(event, srcImg);

    /* Calculate the position of the lens: */
    let x = pos.x - (this.lens.offsetWidth / 2);
    let y = pos.y - (this.lens.offsetHeight / 2);

    /* Prevent the lens from being positioned outside the image: */
    if (x > srcImg.width - this.lens.offsetWidth) {x = srcImg.width - this.lens.offsetWidth;}
    if (x < 0) {x = 0;}
    if (y > srcImg.height - this.lens.offsetHeight) {y = srcImg.height - this.lens.offsetHeight;}
    if (y < 0) {y = 0;}

    const lensPos = {x: x, y: y}
    this.lensPosition.emit(lensPos);

    /* Set the position of the lens: */
    this.renderer.setStyle(this.lens, 'left', `${x}px`);
    this.renderer.setStyle(this.lens, 'top', `${y}px`);

    const lensFocusPos = {x: (x * this.cx), y: (y * this.cy)};

    /* Display what the lens "sees": */
    this.renderer.setStyle(this.zoomResult, 'background-position', `-${lensFocusPos.x}px -${lensFocusPos.y}px`);


  }

  onImgMouseEnter(event: MouseEvent) {

    if (!this.isReady) return;

    this.renderer.removeClass(this.zoomResult, 'hide-lens');
    this.renderer.removeClass(this.lens, 'hide-lens');
  }

  onImgMouseLeave(event: MouseEvent): void {

    if (!this.isReady) return;

    this.renderer.addClass(this.zoomResult, 'hide-lens');
    this.renderer.addClass(this.lens, 'hide-lens');
  }

  private static getCursorPosition(event: MouseEvent, srcImg: HTMLImageElement): Coordinates {

    const rect = srcImg.getBoundingClientRect();
    /* Calculate the cursor's x and y coordinates, relative to the image: */
    /*let x = event.pageX - rect.left;
    let y = event.pageY - rect.top;
    /!* Consider any page scrolling: *!/
    x = x - window.pageXOffset;
    y = y - window.pageYOffset;*/
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {x : x, y : y};

  }


}
