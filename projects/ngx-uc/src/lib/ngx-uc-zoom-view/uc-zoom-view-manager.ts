import {ElementRef, Renderer2} from "@angular/core";
import {UcCoordinates} from "../uc-coordinates";
import {EnforcedUcZoomViewConfig, UC_ZOOM_VIEW_DEFAULT_CONFIG, UcZoomViewConfig, UcZoomViewPosition} from "./uc-zoom-view-config";

enum ComputedDimensionType {
  WIDTH =  'width',
  HEIGHT = 'height'
}

export abstract class UcZoomViewManager {

  turnedOn = true;

  get container() {
    return this.outerDiv;
  }

  get zoomLens() {
    return this.lens;
  }

  get zoomView() {
    return this.zoomResult;
  }

  abstract get image(): HTMLImageElement;

  protected _config: EnforcedUcZoomViewConfig;

  protected cx: number = 0;
  protected cy: number = 0;

  protected outerDiv!: HTMLDivElement;
  protected zoomResult!: HTMLDivElement;
  protected lens!: HTMLDivElement;
  protected isInitialized = false;
  protected isImageLoaded = false;

  get isReady() {
    return this.isInitialized && this.isImageLoaded;
  }

  constructor(protected elRef: ElementRef,
              protected renderer: Renderer2,
              inputConfig: UcZoomViewConfig | undefined,
              protected lensPositionUpdate: ((coordinates: UcCoordinates) => void)) {
    this._config = UcZoomViewManager.mergeConfig(UC_ZOOM_VIEW_DEFAULT_CONFIG, inputConfig);
  }

  get config() {
    return this._config;
  }

  abstract getImageElement(): HTMLImageElement;

  abstract initializeViewer(): void;

  abstract destroy(): void;

  abstract startZoom(): void;

  abstract finishZoom(): void;

  protected abstract initializeLens(srcImg: HTMLImageElement): void;

  getNativeElement<T>(): T {
    return this.elRef.nativeElement;
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

  isElementA(element: any, tagName: string): boolean {
    return !!element.tagName && element.tagName.toLowerCase() === tagName;
  }

  /**
   * Validate if image has already been loaded.
   * This is a security method to be called after the initialization process to cover the cases where the onImageLoaded
   * listener has been registered after the image load event.
   *
   * @param srcImg The source image
   * @private True if the source image has already been loaded. False otherwise.
   */
  isImageAlreadyLoaded(srcImg:HTMLImageElement): boolean {
    return !!srcImg && srcImg.complete && srcImg.naturalHeight !== 0;
  }

  protected wrapImage(srcImg:HTMLImageElement):HTMLDivElement {
    const parent = this.renderer.parentNode(srcImg);
    const wrapperDiv = this.renderer.createElement('div');
    this.renderer.addClass(wrapperDiv, this.config.cssClasses.imageContainer);
    this.renderer.insertBefore(parent, wrapperDiv, srcImg);
    this.renderer.removeChild(parent, srcImg, true);
    this.renderer.appendChild(wrapperDiv, srcImg);

    return wrapperDiv;
  }

  protected createZoomResultContainer(srcImg:HTMLImageElement): HTMLDivElement {
    const zoomResult: HTMLDivElement = this.renderer.createElement('div');
    this.renderer.addClass(zoomResult, this.config.cssClasses.zoomView);
    this.renderer.appendChild(this.renderer.parentNode(srcImg), zoomResult);
    this.setViewPosition(zoomResult, srcImg);

    return zoomResult;
  }

  protected creatLens(srcImg:HTMLImageElement):HTMLDivElement {
    const lens: HTMLDivElement = this.renderer.createElement('div');
    this.renderer.addClass(lens, this.config.cssClasses.lens);
    this.renderer.insertBefore(this.renderer.parentNode(srcImg), lens, srcImg);
    return lens;
  }

  protected initializeZoomDiv(srcImg: HTMLImageElement): void {
    this.setZoomViewResultImage(srcImg);
    if(this.isImageLoaded) {
      this.initializeZoomDivBackgroundSize(srcImg);
    }
    this.renderer.addClass(this.zoomResult, this.config.cssClasses.hideLens);
  }

  protected calculateRatioBetweenResultAndLens(): void {
    /* Calculate the ratio between result DIV and lens: */
    this.cx = this.zoomResult.offsetWidth / this.lens.offsetWidth;
    this.cy = this.zoomResult.offsetHeight / this.lens.offsetHeight;
  }

  protected setZoomViewResultImage(srcImg: HTMLImageElement): void {
    const backGroundImage = `url("${srcImg.src}")`;
    this.renderer.setStyle(this.zoomResult, 'background-image', backGroundImage);
  }

  protected initializeZoomDivBackgroundSize(srcImg: HTMLImageElement): void {
    const bw = srcImg.width * this.cx;
    const bh = srcImg.height * this.cy;
    this.renderer.setStyle(this.zoomResult, 'background-size', `${bw}px ${bh}px`);
  }

  protected resetZoomView(): void {
    this.renderer.removeStyle(this.zoomResult, 'background-image');
    this.renderer.removeStyle(this.zoomResult, 'background-size');
    this.renderer.removeStyle(this.zoomResult, 'background-position');
  }

  protected setViewPosition(zoomResult: HTMLDivElement, srcImg: HTMLImageElement) {
    switch (this.config.viewPosition) {
      case UcZoomViewPosition.BOTTOM:
        const bottomPositionValue = srcImg.height + this.config.viewDistance;
        this.renderer.setStyle(zoomResult, 'top', `${bottomPositionValue}px`);
        break;
      case UcZoomViewPosition.TOP:
        const zoomResultWidth = UcZoomViewManager.getComputedDivValue(zoomResult, ComputedDimensionType.WIDTH);
        const topPositionValue = -(zoomResultWidth + this.config.viewDistance);
        this.renderer.setStyle(zoomResult, 'top', `${topPositionValue}px`);
        break;
      case UcZoomViewPosition.LEFT:
        const zoomResultHeight = UcZoomViewManager.getComputedDivValue(zoomResult, ComputedDimensionType.HEIGHT);
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

  protected calculateLensPosition(event: MouseEvent, srcImg: HTMLImageElement, lens: HTMLDivElement): UcCoordinates {
    /* Get the cursor's x and y positions: */
    const pos = this.getCursorPosition(event, srcImg);

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

  protected getCursorPosition(event: MouseEvent, srcImg: HTMLImageElement): UcCoordinates {

    const rect = srcImg.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {x : x, y : y};

  }
}
