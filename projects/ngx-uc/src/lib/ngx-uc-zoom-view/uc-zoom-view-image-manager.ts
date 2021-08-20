import {UcZoomViewManager} from "./uc-zoom-view-manager";
import {ElementRef, Renderer2} from "@angular/core";
import {UcZoomViewConfig} from "./uc-zoom-view-config";
import {UcCoordinates} from "../uc-coordinates";

export class UcZoomViewImageManager extends UcZoomViewManager{

  get image(): HTMLImageElement {
    return this.getImageElement();
  }

  private readonly srcMutationObserver!: MutationObserver;

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
  }

  getImageElement(): HTMLImageElement {
    return this.elRef.nativeElement;
  }

  initializeViewer(): void {
    const image = this.getImageElement();
    this.outerDiv = this.wrapImage(image);
    this.attachListenersToImage(image);
    this.initializeLensAndResult(image);
    this.isInitialized = true;
    this.isImageLoaded = this.isImageAlreadyLoaded(image);
  }

  destroy(): void {
    this.unListeners.forEach(unl => unl());
    if (this.srcMutationObserver) {
      this.srcMutationObserver.disconnect();
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
  }

  private initializeLensAndResult(srcImg:HTMLImageElement): void {
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
    this.initializeZoomDivBackgroundSize(srcImg);
    this.isImageLoaded = true;
  }

  private onImageLoadFailed() {
    console.error('uc-zoom-view: It was not possible to load the image!');
  }

  startZoom(): void {
    if (this.isSetExternalViewWithResetOn()) {
      this.initializeZoomDiv(this.getImageElement());
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
    const srcImage = this.getImageElement();
    this.setZoomViewResultImage(srcImage);
    this.initializeZoomDivBackgroundSize(srcImage);
  }

  private isSetExternalViewWithResetOn(): boolean {
    return this.ucZoomResultView && this.config.resetExtViewOnMouseLeave;
  }
}
