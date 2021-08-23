import {UcZoomViewManager} from "./uc-zoom-view-manager";
import {ElementRef, Renderer2} from "@angular/core";

import {UcZoomViewConfig} from "./uc-zoom-view-config";
import {UcCoordinates} from "../uc-coordinates";

export class UcZoomViewImageManager extends UcZoomViewManager{

  get image(): HTMLImageElement {
    return this.getNativeElement();
  }

  private readonly srcMutationObserver!: MutationObserver;

  private readonly imageResizeObserver!: ResizeObserver;

  private unListeners: (() => void)[] = [];

  constructor(elRef: ElementRef,
              renderer: Renderer2,
              protected ucZoomResultView: any,
              inputConfig: UcZoomViewConfig | undefined,
              lensPositionUpdate: ((coordinates: UcCoordinates) => void)) {
    super(elRef, renderer, inputConfig, lensPositionUpdate);

    if(!this.isElementA(elRef.nativeElement, 'img')) {
      throw TypeError('elRef should be a valid HTMLImageElement');
    }

    const that = this;
    this.srcMutationObserver = new MutationObserver((changes) => {
      changes.forEach(change => {
        if(change.attributeName === 'src') {
          that.onImageSourceChange();
        }
      });
    });

    this.imageResizeObserver = new ResizeObserver(() => {
      that.onImageResized();
    });
  }

  initializeViewer(): void {
    const rootImage = this.image;
    this.outerDiv = this.wrapImage(rootImage);
    this.attachListenersToImage(rootImage);
    this.initializeLensAndResult(rootImage);
    this.isInitialized = true;
    this.isImageLoaded = this.isImageAlreadyLoaded(rootImage);
  }

  destroy(): void {
    this.unListeners.forEach(unl => unl());
    if (this.srcMutationObserver) {
      this.srcMutationObserver.disconnect();
    }
    if (this.imageResizeObserver) {
      this.imageResizeObserver.disconnect();
    }
    this.unWrapImage(this.elRef.nativeElement);
  }

  private unWrapImage(srcImg:HTMLImageElement): void {
    this.renderer.removeChild(this.outerDiv, srcImg);
    this.renderer.removeChild(this.outerDiv, this.lens);
    if (!this.ucZoomResultView) {
      this.renderer.removeChild(this.outerDiv, this.zoomResult);
    }
    const parent = this.renderer.parentNode(this.outerDiv);
    this.renderer.insertBefore(parent, srcImg, this.outerDiv, true);
    this.renderer.removeChild(parent, this.outerDiv);
  }

  private attachListenersToImage(srcImg:HTMLImageElement): void {
    this.unListeners.push(this.renderer.listen(srcImg, 'mousemove', event => {this.onImgMouseMove(event, srcImg)}));
    this.unListeners.push(this.renderer.listen(srcImg, 'mouseenter', event => {this.onImgMouseEnter(event)}));
    this.unListeners.push(this.renderer.listen(srcImg, 'load', () => this.onImageLoaded(srcImg)));
    this.unListeners.push(this.renderer.listen(srcImg, 'error', ()=> this.onImageLoadFailed() ));
    this.srcMutationObserver.observe(srcImg, {attributes: true});
    if (this.config.lensOptions.automaticResize) {
      this.imageResizeObserver.observe(srcImg);
    }
  }

  protected onImageResized() {
    if(this.isReady) {
      if (this.config.lensOptions.automaticResize){
        this.resizeLens();
      }
      this.setViewPosition(this.zoomResult, this.image);
    }
  }

  private initializeLensAndResult(srcImg:HTMLImageElement): void {
    if(this.ucZoomResultView) {
      this.setExternalZoomResultContainer();
    } else {
      this.zoomResult = this.createZoomResultContainer(srcImg);
    }
    this.lens = this.creatLens(srcImg);

    this.isImageLoaded = this.isImageAlreadyLoaded(srcImg);
    if (this.isImageLoaded) {
      this.initializeLensDimensions(srcImg);
    }

    this.calculateRatioBetweenResultAndLens();

    if(!this.isSetExternalViewWithResetOn()) {
      this.initializeZoomDiv(srcImg);
    }
    this.initializeLens(srcImg);
  }

  private initializeLensDimensions(srcImg:HTMLImageElement): void {
    this.lensSizeProportion = this.calculateLensDimensionsProportion(srcImg, this.lens);

    if (this.config.lensOptions.automaticResize && this.config.lensOptions.sizeProportion !== 'inferred') {
      this.updateLensDimensions(srcImg);
    }
  }

  protected initializeLens(srcImg: HTMLImageElement): void {
    this.renderer.addClass(this.lens, this.config.cssClasses.hideLens);
    this.renderer.listen(this.lens, 'mousemove', event => {this.onImgMouseMove(event, srcImg)});
    this.renderer.listen(this.lens, 'mouseleave', event => {this.onImgMouseLeave(event)});
  }

  private setExternalZoomResultContainer(): void {
    if (this.isElementA(this.ucZoomResultView, 'div')) {
      this.zoomResult = this.ucZoomResultView;
    } else {
      throw new TypeError('The view object is not a div. A custom zoom view should be a div.');
    }
  }

  protected initializeZoomDiv(srcImg: HTMLImageElement): void {
    this.setZoomViewResultImage(srcImg);
    if(this.isImageLoaded) {
      this.initializeZoomDivBackgroundSize(srcImg);
    }
    if(!this.ucZoomResultView) {
      this.renderer.addClass(this.zoomResult, this.config.cssClasses.hideLens);
    }
  }

  private onImgMouseMove(event: MouseEvent, imgElement: HTMLImageElement | null = null): void {
    event.preventDefault();

    if (!this.isReady || !this.turnedOn) return;

    const srcImg = imgElement? imgElement : event.target as HTMLImageElement;

    const lensPos = this.calculateLensPosition(event, srcImg, this.lens);
    //this.lensPosition.emit(lensPos);
    this.lensPositionUpdate(lensPos);

    /* Set the position of the lens: */
    this.renderer.setStyle(this.lens, 'left', `${lensPos.x}px`);
    this.renderer.setStyle(this.lens, 'top', `${lensPos.y}px`);

    const lensFocusPos = {x: (lensPos.x * this.cx), y: (lensPos.y * this.cy)};

    /* Display what the lens "sees": */
    this.renderer.setStyle(this.zoomResult, 'background-position', `-${lensFocusPos.x}px -${lensFocusPos.y}px`);

  }

  private onImgMouseEnter(event: MouseEvent) {

    if (!this.isReady || !this.turnedOn) return;

    this.startZoom();
  }

  private onImgMouseLeave(event: MouseEvent): void {

    if (!this.isReady) return;

    this.finishZoom();
  }

  private onImageLoaded(srcImg:HTMLImageElement) {
    if (!this.lensSizeProportion) {
      this.initializeLensDimensions(srcImg);
    }

    this.initializeZoomDivBackgroundSize(srcImg);
    this.isImageLoaded = true;
  }

  private onImageLoadFailed() {
  }

  startZoom(): void {
    if (this.isSetExternalViewWithResetOn()) {
      this.initializeZoomDiv(this.image);
    }

    if(!this.ucZoomResultView) {
      this.renderer.removeClass(this.zoomResult, this.config.cssClasses.hideLens);
    }
    this.renderer.removeClass(this.lens, this.config.cssClasses.hideLens);
  }

  finishZoom(): void {
    if (this.isSetExternalViewWithResetOn()) {
      this.resetZoomView();
    }

    if(!this.ucZoomResultView) {
      this.renderer.addClass(this.zoomResult, this.config.cssClasses.hideLens);
    }
    this.renderer.addClass(this.lens, this.config.cssClasses.hideLens);
  }

  private onImageSourceChange(): void {
    const srcImage = this.image;
    this.setZoomViewResultImage(srcImage);
    this.initializeZoomDivBackgroundSize(srcImage);
  }

  private isSetExternalViewWithResetOn(): boolean {
    return this.ucZoomResultView && this.config.resetExtViewOnMouseLeave;
  }
}
