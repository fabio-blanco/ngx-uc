import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2} from '@angular/core';
import {EnforcedUcZoomViewConfig, UC_ZOOM_VIEW_DEFAULT_CONFIG, UcZoomViewConfig, UcZoomViewPosition} from "./uc-zoom-view-config";

export interface UcCoordinates {
  x: number,
  y: number
}

enum ComputedDimensionType {
  WIDTH =  'width',
  HEIGHT = 'height'
}

@Component({
  selector: 'img[uc-zoom-view]',
  exportAs: 'ucNgZoomView',
  template: '<ng-content></ng-content>'
})
export class UcZoomViewComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output()
  lensPosition = new EventEmitter<UcCoordinates>();

  @Input('uc-zoom-view-config')
  ucZoomViewConfig?: UcZoomViewConfig;

  @Input('uc-z-view')
  ucZoomResultView: any;

  private cx: number = 0;
  private cy: number = 0;

  private outerDiv!: HTMLDivElement;
  private zoomResult!: HTMLDivElement;
  private lens!: HTMLDivElement;
  private isInitialized = false;
  private isImageLoaded = false;

  private config!: EnforcedUcZoomViewConfig;

  private unListeners: (() => void)[] = [];

  private srcMutationObserver!: MutationObserver;

  get isReady() {
    return this.isInitialized && this.isImageLoaded;
  }

  constructor(private elRef:ElementRef,
              private renderer: Renderer2) { }

  ngOnInit(): void {
    this.config = UcZoomViewComponent.mergeConfig(UC_ZOOM_VIEW_DEFAULT_CONFIG, this.ucZoomViewConfig);

    const that = this;
    this.srcMutationObserver = new MutationObserver((changes) => {
      changes.forEach(change => {
        if(change.attributeName === 'src') {
          that.onImageSourceChange();
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.unListeners.forEach(unl => unl());
    if (this.srcMutationObserver) {
      this.srcMutationObserver.disconnect();
    }
    if(this.elRef && UcZoomViewComponent.isElementA(this.elRef.nativeElement, 'img')) {
      this.unWrapImage(this.elRef.nativeElement);
    }
  }

  ngAfterViewInit(): void {
    const element: HTMLElement = this.getNativeElement();
    this.outerDiv = this.wrapImage(element as HTMLImageElement);
    this.attachListenersToImage(element as HTMLImageElement);
    this.initializeLensAndResult(element as HTMLImageElement);
    this.isInitialized = true;
    this.isImageLoaded = UcZoomViewComponent.isImageAlreadyLoaded(element as HTMLImageElement);
  }

  unWrapImage(srcImg:HTMLImageElement): void {
    this.renderer.removeChild(this.outerDiv, srcImg);
    this.renderer.removeChild(this.outerDiv, this.lens);
    if (!this.ucZoomResultView) {
      this.renderer.removeChild(this.outerDiv, this.zoomResult);
    }
    const parent = this.renderer.parentNode(this.outerDiv);
    this.renderer.insertBefore(parent, srcImg, this.outerDiv, true);
    this.renderer.removeChild(parent, this.outerDiv);
  }

  wrapImage(srcImg:HTMLImageElement):HTMLDivElement {
    const parent = this.renderer.parentNode(srcImg);
    const wrapperDiv = this.renderer.createElement('div');
    this.renderer.addClass(wrapperDiv, this.config.cssClasses.imageContainer);
    this.renderer.insertBefore(parent, wrapperDiv, srcImg);
    this.renderer.removeChild(parent, srcImg, true);
    this.renderer.appendChild(wrapperDiv, srcImg);

    return wrapperDiv;
  }

  attachListenersToImage(srcImg:HTMLImageElement): void {
    this.unListeners.push(this.renderer.listen(srcImg, 'mousemove', event => {this.onImgMouseMove(event, srcImg)}));
    this.unListeners.push(this.renderer.listen(srcImg, 'mouseenter', event => {this.onImgMouseEnter(event)}));
    this.unListeners.push(this.renderer.listen(srcImg, 'load', () => this.onImageLoaded(srcImg)));
    this.unListeners.push(this.renderer.listen(srcImg, 'error', ()=> this.onImageLoadFailed() ));
    this.srcMutationObserver.observe(srcImg, {attributes: true});
  }

  initializeLensAndResult(srcImg:HTMLImageElement): void {
    if(this.ucZoomResultView) {
      this.setExternalZoomResultContainer();
    } else {
      this.zoomResult = this.createZoomResultContainer(srcImg);
    }
    this.lens = this.creatLens(srcImg);

    this.calculateRatioBetweenResultAndLens();

    if(!this.isSetExternalViewWithResetOn()) {
      this.initializeZoomDiv(srcImg);
    }
    this.initializeLens(srcImg);
  }

  setExternalZoomResultContainer(): void {
    if (UcZoomViewComponent.isElementA(this.ucZoomResultView, 'div')) {
      this.zoomResult = this.ucZoomResultView;
    } else {
      throw new TypeError('The view object is not a div. A custom zoom view should be a div.')
    }
  }

  private static mergeConfig(defaultConfig: EnforcedUcZoomViewConfig, inputConfig: UcZoomViewConfig | undefined): EnforcedUcZoomViewConfig {
    const merged: EnforcedUcZoomViewConfig = {
      cssClasses: {
        imageContainer: inputConfig?.cssClasses?.imageContainer ? inputConfig.cssClasses.imageContainer : defaultConfig.cssClasses.imageContainer,
        lens: inputConfig?.cssClasses?.lens ? inputConfig.cssClasses.lens : defaultConfig.cssClasses.lens,
        zoomView: inputConfig?.cssClasses?.zoomView ? inputConfig.cssClasses.zoomView : defaultConfig.cssClasses.zoomView,
        hideLens: inputConfig?.cssClasses?.hideLens ? inputConfig.cssClasses.hideLens : defaultConfig.cssClasses.hideLens
      },
      resetExtViewOnMouseLeave: (typeof(inputConfig?.resetExtViewOnMouseLeave) !== 'undefined') ? inputConfig.resetExtViewOnMouseLeave :
        defaultConfig.resetExtViewOnMouseLeave,
      viewPosition: (typeof(inputConfig?.viewPosition) !== 'undefined') ? inputConfig.viewPosition : defaultConfig.viewPosition,
      viewDistance: (typeof(inputConfig?.viewDistance) !== 'undefined') ? inputConfig.viewDistance : defaultConfig.viewDistance
    };

    return merged;
  }

  private initializeLens(srcImg: HTMLImageElement): void {
    this.renderer.addClass(this.lens, this.config.cssClasses.hideLens);
    this.renderer.listen(this.lens, 'mousemove', event => {this.onImgMouseMove(event, srcImg)});
    this.renderer.listen(this.lens, 'mouseleave', event => {this.onImgMouseLeave(event)});
  }

  private initializeZoomDiv(srcImg: HTMLImageElement): void {
    this.setZoomViewResultImage(srcImg);
    if(this.isImageLoaded) {
      this.initializeZoomDivBackgroundSize(srcImg);
    }
    if(!this.ucZoomResultView) {
      this.renderer.addClass(this.zoomResult, this.config.cssClasses.hideLens);
    }
  }

  private setZoomViewResultImage(srcImg: HTMLImageElement): void {
    const backGroundImage = `url("${srcImg.src}")`;
    this.renderer.setStyle(this.zoomResult, 'background-image', backGroundImage);
  }

  private initializeZoomDivBackgroundSize(srcImg: HTMLImageElement): void {
    const bw = srcImg.width * this.cx;
    const bh = srcImg.height * this.cy;
    this.renderer.setStyle(this.zoomResult, 'background-size', `${bw}px ${bh}px`);
  }

  private calculateRatioBetweenResultAndLens(): void {
    /* Calculate the ratio between result DIV and lens: */
    this.cx = this.zoomResult.offsetWidth / this.lens.offsetWidth;
    this.cy = this.zoomResult.offsetHeight / this.lens.offsetHeight;
  }

  creatLens(srcImg:HTMLImageElement):HTMLDivElement {
    const lens: HTMLDivElement = this.renderer.createElement('div');
    this.renderer.addClass(lens, this.config.cssClasses.lens);
    this.renderer.insertBefore(this.renderer.parentNode(srcImg), lens, srcImg);
    return lens;
  }

  createZoomResultContainer(srcImg:HTMLImageElement): HTMLDivElement {
    const zoomResult: HTMLDivElement = this.renderer.createElement('div');
    this.renderer.addClass(zoomResult, this.config.cssClasses.zoomView);
    this.renderer.appendChild(this.renderer.parentNode(srcImg), zoomResult);
    this.setViewPosition(zoomResult, srcImg);

    return zoomResult;
  }

  onImgMouseMove(event: MouseEvent, imgElement: HTMLImageElement | null = null): void {
    event.preventDefault();

    if (!this.isReady) return;

    const srcImg = imgElement? imgElement : event.target as HTMLImageElement;

    const lensPos = UcZoomViewComponent.calculateLensPosition(event, srcImg, this.lens);
    this.lensPosition.emit(lensPos);

    /* Set the position of the lens: */
    this.renderer.setStyle(this.lens, 'left', `${lensPos.x}px`);
    this.renderer.setStyle(this.lens, 'top', `${lensPos.y}px`);

    const lensFocusPos = {x: (lensPos.x * this.cx), y: (lensPos.y * this.cy)};

    /* Display what the lens "sees": */
    this.renderer.setStyle(this.zoomResult, 'background-position', `-${lensFocusPos.x}px -${lensFocusPos.y}px`);

  }

  onImgMouseEnter(event: MouseEvent) {

    if (!this.isReady) return;

    if (this.isSetExternalViewWithResetOn()) {
      this.initializeZoomDiv(this.getNativeElement() as HTMLImageElement);
    }

    if(!this.ucZoomResultView) {
      this.renderer.removeClass(this.zoomResult, this.config.cssClasses.hideLens);
    }
    this.renderer.removeClass(this.lens, this.config.cssClasses.hideLens);
  }

  onImgMouseLeave(event: MouseEvent): void {

    if (!this.isReady) return;

    if (this.isSetExternalViewWithResetOn()) {
      this.resetZoomView();
    }

    if(!this.ucZoomResultView) {
      this.renderer.addClass(this.zoomResult, this.config.cssClasses.hideLens);
    }
    this.renderer.addClass(this.lens, this.config.cssClasses.hideLens);
  }

  onImageLoaded(srcImg:HTMLImageElement) {
    this.initializeZoomDivBackgroundSize(srcImg);
    this.isImageLoaded = true;
  }

  onImageLoadFailed() {
    console.error('uc-zoom-view: It was not possible to load the image!');
  }

  private onImageSourceChange(): void {
    const srcImage: HTMLImageElement = this.getNativeElement() as HTMLImageElement;
    this.setZoomViewResultImage(srcImage);
    this.initializeZoomDivBackgroundSize(srcImage);
  }

  private setViewPosition(zoomResult: HTMLDivElement, srcImg: HTMLImageElement) {
    switch (this.config.viewPosition) {
      case UcZoomViewPosition.BOTTOM:
        const bottomPositionValue = srcImg.height + this.config.viewDistance;
        this.renderer.setStyle(zoomResult, 'top', `${bottomPositionValue}px`);
        break;
      case UcZoomViewPosition.TOP:
        const zoomResultWidth = UcZoomViewComponent.getComputedDivValue(zoomResult, ComputedDimensionType.WIDTH);
        const topPositionValue = -(zoomResultWidth + this.config.viewDistance);
        this.renderer.setStyle(zoomResult, 'top', `${topPositionValue}px`);
        break;
      case UcZoomViewPosition.LEFT:
        const zoomResultHeight = UcZoomViewComponent.getComputedDivValue(zoomResult, ComputedDimensionType.HEIGHT);
        const leftPositionValue = -(zoomResultHeight + this.config.viewDistance);
        this.renderer.setStyle(zoomResult, 'left', `${leftPositionValue}px`);
        break;
      case UcZoomViewPosition.RIGHT:
      default:
        const rightPositionValue = srcImg.width + this.config.viewDistance;
        this.renderer.setStyle(zoomResult, 'left', `${rightPositionValue}px`);
    }
  }

  private static getComputedDivValue(div: HTMLDivElement, type: ComputedDimensionType): number {
    const computedStyles = window.getComputedStyle(div);
    const strValue = computedStyles.getPropertyValue(type);
    return parseFloat(strValue);
  }

  private resetZoomView(): void {
    this.renderer.removeStyle(this.zoomResult, 'background-image');
    this.renderer.removeStyle(this.zoomResult, 'background-size');
    this.renderer.removeStyle(this.zoomResult, 'background-position');
  }

  private isSetExternalViewWithResetOn(): boolean {
    return this.ucZoomResultView && this.config.resetExtViewOnMouseLeave;
  }

  private static isElementA(element: any, tagName: string): boolean {
    return element.tagName && element.tagName.toLowerCase() === tagName;
  }

  /**
   * Validate if image has already been loaded.
   * This is a security method to be called after the initialization process to cover the cases where the onImageLoaded
   * listener has been registered after the image load event.
   *
   * @param srcImg The source image
   * @private True if the source image has already been loaded. False otherwise.
   */
  private static isImageAlreadyLoaded(srcImg:HTMLImageElement): boolean {
    return !!srcImg && srcImg.complete && srcImg.naturalHeight !== 0;
  }

  private getNativeElement(): HTMLElement {
    return this.elRef.nativeElement;
  }

  private static calculateLensPosition(event: MouseEvent, srcImg: HTMLImageElement, lens: HTMLDivElement): UcCoordinates {
    /* Get the cursor's x and y positions: */
    const pos = UcZoomViewComponent.getCursorPosition(event, srcImg);

    /* Calculate the position of the lens: */
    let x = pos.x - (lens.offsetWidth / 2);
    let y = pos.y - (lens.offsetHeight / 2);

    /* Prevent the lens from being positioned outside the image: */
    if (x > srcImg.width - lens.offsetWidth) {
      x = srcImg.width - lens.offsetWidth;
    }
    if (x < 0) {
      x = 0;
    }
    if (y > srcImg.height - lens.offsetHeight) {
      y = srcImg.height - lens.offsetHeight;
    }
    if (y < 0) {
      y = 0;
    }

    return {x: x, y: y};
  }

  private static getCursorPosition(event: MouseEvent, srcImg: HTMLImageElement): UcCoordinates {

    const rect = srcImg.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {x : x, y : y};

  }

}
