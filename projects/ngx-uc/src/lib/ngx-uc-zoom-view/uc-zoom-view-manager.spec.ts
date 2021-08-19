import {UcZoomViewManager} from './uc-zoom-view-manager';
import {ElementRef, Renderer2, RendererStyleFlags2} from "@angular/core";
import {UcCoordinates} from "../uc-coordinates";
import {UC_ZOOM_VIEW_DEFAULT_CONFIG, UcZoomViewConfig, UcZoomViewPosition} from "./uc-zoom-view-config";

class Implementation extends UcZoomViewManager {
  getImageElement(): HTMLImageElement {
    return null as any;
  }

  initializeViewer(): void {}

  destroy(): void {}

  finishZoom(): void {}

  startZoom(): void {}

  protected initializeLens(srcImg: HTMLImageElement): void {}

  callGetCursorPosition(event: MouseEvent, srcImg: HTMLImageElement): UcCoordinates {
    return super.getCursorPosition(event, srcImg);
  }

  callCalculateLensPosition(event: MouseEvent, srcImg: HTMLImageElement, lens: HTMLDivElement): UcCoordinates {
    return super.calculateLensPosition(event, srcImg, lens);
  }

  callWrapImage(srcImg:HTMLImageElement):HTMLDivElement {
    return this.wrapImage(srcImg);
  }

  callCreateZoomResultContainer(srcImg:HTMLImageElement): HTMLDivElement {
    return this.createZoomResultContainer(srcImg);
  }

  callSetViewPosition(zoomResult: HTMLDivElement, srcImg: HTMLImageElement) {
    return this.setViewPosition(zoomResult, srcImg);
  }

  callCreatLens(srcImg:HTMLImageElement):HTMLDivElement {
    return this.creatLens(srcImg);
  }

  callCalculateRatioBetweenResultAndLens(): void {
    return this.calculateRatioBetweenResultAndLens();
  }

  callInitializeZoomDivBackgroundSize(srcImg: HTMLImageElement): void {
    return this.initializeZoomDivBackgroundSize(srcImg);
  }

  callSetZoomViewResultImage(srcImg: HTMLImageElement): void {
    return this.setZoomViewResultImage(srcImg);
  }

  callInitializeZoomDiv(srcImg: HTMLImageElement): void {
    return this.initializeZoomDiv(srcImg);
  }
}

describe('UcZoomViewManager', () => {

  let zoomViewManager: Implementation;
  let rendererStub = <Renderer2>{
    parentNode(node: any): any {},
    createElement(name: string, namespace?: string | null): any {},
    addClass(el: any, name: string) {},
    insertBefore(parent: any, newChild: any, refChild: any, isMove?: boolean) {},
    removeChild(parent: any, oldChild: any, isHostElement?: boolean) {},
    appendChild(parent: any, newChild: any) {},
    removeStyle(el: any, style: string, flags?: RendererStyleFlags2) {},
    setStyle(el: any, style: string, value: any, flags?: RendererStyleFlags2) {}
  };
  let lensPositionCallback = (coordinates: UcCoordinates) => {}

  beforeEach(() => {
    const elRef: ElementRef = new ElementRef('a native element');
    zoomViewManager = new Implementation(elRef, rendererStub, undefined, lensPositionCallback);
  });

  it('should create an instance', () => {
    expect(zoomViewManager).toBeTruthy();
  });

  it('.mergeConfig should properly merge with no provided config', () => {
    const config = UC_ZOOM_VIEW_DEFAULT_CONFIG;

    const result = (UcZoomViewManager as any).mergeConfig(config, undefined);

    expect(result).toBeTruthy();
    expect(result.cssClasses).toBeTruthy();
    expect(result.cssClasses.imageContainer).toBe('uc-img-container');
    expect(result.cssClasses.lens).toBe('uc-img-zoom-lens');
    expect(result.cssClasses.zoomView).toBe('uc-img-zoom-result');
    expect(result.cssClasses.hideLens).toBe('uc-hide-lens');
    expect(result.resetExtViewOnMouseLeave).toBeTrue();
    expect(result.viewPosition).toBe(UcZoomViewPosition.RIGHT);
  });

  it('.mergeConfig should properly merge with empty config', () => {
    const config = UC_ZOOM_VIEW_DEFAULT_CONFIG;

    const result = (UcZoomViewManager as any).mergeConfig(config, {});

    expect(result).toBeTruthy();
    expect(result.cssClasses).toBeTruthy();
    expect(result.cssClasses.imageContainer).toBe('uc-img-container');
    expect(result.cssClasses.lens).toBe('uc-img-zoom-lens');
    expect(result.cssClasses.zoomView).toBe('uc-img-zoom-result');
    expect(result.cssClasses.hideLens).toBe('uc-hide-lens');
    expect(result.resetExtViewOnMouseLeave).toBeTrue();
    expect(result.viewPosition).toBe(UcZoomViewPosition.RIGHT);
  });

  it('.mergeConfig should properly merge with partially provided config', () => {
    const config = UC_ZOOM_VIEW_DEFAULT_CONFIG;

    const hideLens = 'dont-hide-nothing-i-am-crazy';

    const result = (UcZoomViewManager as any).mergeConfig(config, {cssClasses: {hideLens: hideLens}});

    expect(result).toBeTruthy();
    expect(result.cssClasses).toBeTruthy();
    expect(result.cssClasses.imageContainer).toBe('uc-img-container');
    expect(result.cssClasses.lens).toBe('uc-img-zoom-lens');
    expect(result.cssClasses.zoomView).toBe('uc-img-zoom-result');
    expect(result.cssClasses.hideLens).toBe(hideLens);
    expect(result.resetExtViewOnMouseLeave).toBeTrue();
    expect(result.viewPosition).toBe(UcZoomViewPosition.RIGHT);
  });

  it('.mergeConfig should properly merge with full provided config', () => {
    const config = UC_ZOOM_VIEW_DEFAULT_CONFIG;

    const fullyProvidedConfig: UcZoomViewConfig = {
      cssClasses: {
        imageContainer: 'different-container-class',
        lens: 'different-lens-class',
        zoomView: 'different-zoom-view-class',
        hideLens: 'different-hide-lens-class'
      },
      resetExtViewOnMouseLeave: false,
      viewPosition: UcZoomViewPosition.LEFT
    };

    const result = (UcZoomViewManager as any).mergeConfig(config, fullyProvidedConfig);

    expect(result).toBeTruthy();
    expect(result.cssClasses).toBeTruthy();
    expect(result.cssClasses.imageContainer).toBe(fullyProvidedConfig.cssClasses?.imageContainer);
    expect(result.cssClasses.lens).toBe(fullyProvidedConfig.cssClasses?.lens);
    expect(result.cssClasses.zoomView).toBe(fullyProvidedConfig.cssClasses?.zoomView);
    expect(result.cssClasses.hideLens).toBe(fullyProvidedConfig.cssClasses?.hideLens);
    expect(result.resetExtViewOnMouseLeave).toBeFalse();
    expect(result.viewPosition).toBe(UcZoomViewPosition.LEFT);
  });

  it('.getNativeElement should return the root native element', () => {
    expect(zoomViewManager.getNativeElement()).toEqual('a native element');
  });

  it('.isElementA should return true when the tested object owns a tag with the given name', () => {
    const object = {
      tagName: 'DIV'
    };

    expect(zoomViewManager.isElementA(object, 'div')).toBeTrue();
  });

  it('.isElementA should return false when the tested object does not owns a tag with the given name', () => {
    expect(zoomViewManager.isElementA({}, 'div')).toBeFalse();

    expect(zoomViewManager.isElementA({tagName: 'IMG'}, 'div')).toBeFalse();
  });

  it('.isImageAlreadyLoaded should return true if image is completely loaded', () => {

    const imgFake: HTMLImageElement = {
      complete: true,
      naturalHeight: 1000
    } as any;

    const isLoaded = zoomViewManager.isImageAlreadyLoaded(imgFake);

    expect(isLoaded).toBeTrue();
  });


  it('.isImageAlreadyLoaded should return false if image is not completely loaded', () => {

    const imgFake: HTMLImageElement = {
      complete: false,
      naturalHeight: 0
    } as any;

    const isLoaded = zoomViewManager.isImageAlreadyLoaded(imgFake);

    expect(isLoaded).toBeFalse();
  });

  it('.wrapImage should wrap the given image in a div container', () => {
    const img: HTMLImageElement = new Image(10, 10);

    const parent = document.body;
    spyOn(rendererStub, 'parentNode').and.returnValue(parent);

    const wrapperDiv = document.createElement('div');
    spyOn(rendererStub, 'createElement').and.returnValue(wrapperDiv);

    spyOn(rendererStub, 'addClass');
    spyOn(rendererStub, 'insertBefore');
    spyOn(rendererStub, 'removeChild');
    spyOn(rendererStub, 'appendChild');

    const returnedWrapperDiv = zoomViewManager.callWrapImage(img);

    expect(rendererStub.parentNode).toHaveBeenCalledWith(img);
    expect(rendererStub.createElement).toHaveBeenCalledOnceWith('div');

    expect(rendererStub.addClass).toHaveBeenCalledOnceWith(wrapperDiv, 'uc-img-container');
    expect(rendererStub.insertBefore).toHaveBeenCalledOnceWith(parent, wrapperDiv, img);
    expect(rendererStub.removeChild).toHaveBeenCalledOnceWith(parent, img, true);
    expect(rendererStub.appendChild).toHaveBeenCalledOnceWith(wrapperDiv, img);
    expect(returnedWrapperDiv).toBe(wrapperDiv);
  });

  it('.createZoomResultContainer should create the zoomResult div, append it and set its position related to the image', () => {
    const img: HTMLImageElement = new Image(10, 20);

    const zoomResultDiv = document.createElement('div');
    spyOn(rendererStub, 'createElement').and.returnValue(zoomResultDiv);

    spyOn(rendererStub, 'addClass');
    spyOn(rendererStub, 'appendChild');

    const parent = document.body;
    spyOn(rendererStub, 'parentNode').and.returnValue(parent);
    spyOn<any>(zoomViewManager, 'setViewPosition');

    const createdZoomResultDiv = zoomViewManager.callCreateZoomResultContainer(img);

    expect(createdZoomResultDiv).toBe(zoomResultDiv);
    expect(rendererStub.addClass).toHaveBeenCalledOnceWith(zoomResultDiv, UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.zoomView);
    expect(rendererStub.parentNode).toHaveBeenCalledOnceWith(img);
    expect(rendererStub.appendChild).toHaveBeenCalledOnceWith(parent, createdZoomResultDiv);
    expect(zoomViewManager['setViewPosition']).toHaveBeenCalledOnceWith(zoomResultDiv, img);
  });

  it('.creatLens should create the lens div and attach before the given image', () => {
    const img: HTMLImageElement = new Image(10, 10);

    const lensDiv = document.createElement('div');
    spyOn(rendererStub, 'createElement').and.returnValue(lensDiv);

    spyOn(rendererStub, 'addClass');
    spyOn(rendererStub, 'insertBefore');

    const parent = document.body;
    spyOn(rendererStub, 'parentNode').and.returnValue(parent);

    const createdLens = zoomViewManager.callCreatLens(img);

    expect(createdLens).toBe(lensDiv);
    expect(rendererStub.addClass).toHaveBeenCalledOnceWith(lensDiv, UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.lens);
    expect(rendererStub.parentNode).toHaveBeenCalledOnceWith(img);
    expect(rendererStub.insertBefore).toHaveBeenCalledOnceWith(parent, createdLens, img);

  });

  it('.initializeZoomDiv should initialize zoom div by setting the given image as the background, initializing its size and by hiding it', () => {
    const fakeSrc = 'anyimage.jpeg';
    const fakeWidth = 10;
    const fakeHeight = 20;

    const imgStub = {
      src: fakeSrc,
      width: fakeWidth,
      height: fakeHeight
    } as HTMLImageElement;

    spyOn<any>(zoomViewManager, 'setZoomViewResultImage');
    spyOn<any>(zoomViewManager, 'initializeZoomDivBackgroundSize');
    spyOn(rendererStub, 'addClass');
    zoomViewManager['isImageLoaded'] = true;
    const zoomResultDiv = document.createElement('div');
    zoomViewManager['zoomResult'] = zoomResultDiv;

    zoomViewManager.callInitializeZoomDiv(imgStub);

    expect(zoomViewManager['setZoomViewResultImage']).toHaveBeenCalledOnceWith(imgStub);
    expect(zoomViewManager['initializeZoomDivBackgroundSize']).toHaveBeenCalledOnceWith(imgStub);
    expect(rendererStub.addClass).toHaveBeenCalledOnceWith(zoomResultDiv, UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens);
  });

  it('.initializeZoomDiv should not initialize zoom background if image is not yet loaded', () => {
    const fakeSrc = 'anyimage.jpeg';
    const fakeWidth = 10;
    const fakeHeight = 20;

    const imgStub = {
      src: fakeSrc,
      width: fakeWidth,
      height: fakeHeight
    } as HTMLImageElement;

    spyOn<any>(zoomViewManager, 'setZoomViewResultImage');
    spyOn<any>(zoomViewManager, 'initializeZoomDivBackgroundSize');
    zoomViewManager['isImageLoaded'] = false;

    zoomViewManager.callInitializeZoomDiv(imgStub);

    expect(zoomViewManager['initializeZoomDivBackgroundSize']).not.toHaveBeenCalled();
  });

  it('.calculateRatioBetweenResultAndLens should calculate the ratio between result and lens', () => {
    const zoomResultDivStub: Partial<HTMLDivElement> = {
      offsetWidth: 20,
      offsetHeight: 60
    };
    zoomViewManager['zoomResult'] = zoomResultDivStub as HTMLDivElement;

    const lensDivStub: Partial<HTMLDivElement> = {
      offsetWidth: 2,
      offsetHeight: 3
    };
    zoomViewManager['lens'] = lensDivStub as HTMLDivElement;

    zoomViewManager.callCalculateRatioBetweenResultAndLens();

    expect(zoomViewManager['cx']).toBe(10);
    expect(zoomViewManager['cy']).toBe(20);

  });

  it('.setZoomViewResultImage should calculate the ratio between result and lens', () => {
    const fakeSrc = 'anyimage.jpeg';
    const imgStub = {
      src: fakeSrc
    } as HTMLImageElement;

    const zoomResultDivFake = document.createElement('div');
    zoomViewManager['zoomResult'] = zoomResultDivFake;

    spyOn(rendererStub, 'setStyle');

    zoomViewManager.callSetZoomViewResultImage(imgStub);

    expect(rendererStub.setStyle).toHaveBeenCalledOnceWith(zoomResultDivFake, 'background-image', `url("${fakeSrc}")`);

  });

  it('.initializeZoomDivBackgroundSize should set the background image size of the zoom div', () => {
    const fakeSrc = 'anyimage.jpeg';
    const fakeWidth = 10;
    const fakeHeight = 20;

    const imgStub: Partial<HTMLImageElement> = {
      src: fakeSrc,
      width: fakeWidth,
      height: fakeHeight
    };

    zoomViewManager['cx'] = 3;
    zoomViewManager['cy'] = 2;
    const zoomResultDiv = document.createElement('div');
    zoomViewManager['zoomResult'] = zoomResultDiv;

    spyOn(rendererStub, 'setStyle');

    zoomViewManager.callInitializeZoomDivBackgroundSize(imgStub as HTMLImageElement);

    expect(rendererStub.setStyle).toHaveBeenCalledOnceWith(zoomResultDiv, 'background-size','30px 40px');
  });

  it('.resetZoomView should reset the zoom view', () => {
    spyOn(rendererStub, 'removeStyle');

    const zoomResultDiv = document.createElement('div');
    zoomViewManager['zoomResult'] = zoomResultDiv;

    zoomViewManager['resetZoomView']();

    expect(rendererStub.removeStyle).toHaveBeenCalledWith(zoomResultDiv, 'background-image');
    expect(rendererStub.removeStyle).toHaveBeenCalledWith(zoomResultDiv, 'background-size');
    expect(rendererStub.removeStyle).toHaveBeenCalledWith(zoomResultDiv, 'background-position');
  });

  it('.setViewPosition should properly position the zoom result div at the bottom of the image', () => {
    const zoomResultDiv = document.createElement('div');

    const img: HTMLImageElement = new Image(10, 20);

    spyOn(rendererStub, 'setStyle');
    zoomViewManager['config'].viewPosition = UcZoomViewPosition.BOTTOM;

    zoomViewManager.callSetViewPosition(zoomResultDiv, img);

    const value = img.height + zoomViewManager['config'].viewDistance;
    expect(rendererStub.setStyle).toHaveBeenCalledOnceWith(zoomResultDiv, 'top', `${value}px`);
  });

  it('.setViewPosition should properly position the zoom result div at the top of the image', () => {
    const zoomResultDiv = document.createElement('div');

    const img: HTMLImageElement = new Image(10, 20);

    const computedValue = 30;
    spyOn<any>(UcZoomViewManager, 'getComputedDivValue').and.returnValue(computedValue);
    spyOn(rendererStub, 'setStyle');
    zoomViewManager['config'].viewPosition = UcZoomViewPosition.TOP;

    zoomViewManager.callSetViewPosition(zoomResultDiv, img);

    const value = -(computedValue + zoomViewManager['config'].viewDistance);
    expect(rendererStub.setStyle).toHaveBeenCalledOnceWith(zoomResultDiv, 'top', `${value}px`);
  });

  it('.setViewPosition should properly position the zoom result div at the left of the image', () => {
    const zoomResultDiv = document.createElement('div');

    const img: HTMLImageElement = new Image(10, 20);

    const computedValue = 30;
    spyOn<any>(UcZoomViewManager, 'getComputedDivValue').and.returnValue(computedValue);
    spyOn(rendererStub, 'setStyle');
    zoomViewManager['config'].viewPosition = UcZoomViewPosition.LEFT;

    zoomViewManager.callSetViewPosition(zoomResultDiv, img);

    const value = -(computedValue + zoomViewManager['config'].viewDistance);
    expect(rendererStub.setStyle).toHaveBeenCalledOnceWith(zoomResultDiv, 'left', `${value}px`);
  });

  it('.setViewPosition should properly position the zoom result div at the right of the image with a correct calculation', () => {
    const zoomResultDiv = document.createElement('div');

    const img: HTMLImageElement = new Image(10, 20);

    const distance = 10;

    spyOn(rendererStub, 'setStyle');
    zoomViewManager['config'].viewPosition = UcZoomViewPosition.RIGHT;
    zoomViewManager['config'].viewDistance = distance;

    zoomViewManager.callSetViewPosition(zoomResultDiv, img);

    const value = img.width + distance;
    expect(rendererStub.setStyle).toHaveBeenCalledOnceWith(zoomResultDiv, 'left', `${value}px`);
  });

  it('.setViewPosition should properly position the zoom result div at the bottom of the image with a correct calculation', () => {
    const zoomResultDiv = document.createElement('div');

    const img: HTMLImageElement = new Image(10, 20);

    const distance = 10;

    spyOn(rendererStub, 'setStyle');
    zoomViewManager['config'].viewPosition = UcZoomViewPosition.BOTTOM;
    zoomViewManager['config'].viewDistance = distance;

    zoomViewManager.callSetViewPosition(zoomResultDiv, img);

    const value = img.height + distance;
    expect(rendererStub.setStyle).toHaveBeenCalledOnceWith(zoomResultDiv, 'top', `${value}px`);
  });

  it('.getCursorPosition should get the actual pointer position inside the image', () => {

    const imageWidth = 1000;
    const imageHeight = 800;

    const imgFake: HTMLImageElement = new Image(imageWidth, imageHeight);

    const eventFake: MouseEvent = {
      clientX: 100,
      clientY: 100
    } as any;

    spyOn(imgFake, 'getBoundingClientRect').and.returnValue(new DOMRect(50, 40, imageWidth, imageHeight));

    const result = zoomViewManager.callGetCursorPosition(eventFake, imgFake);

    expect(result).toEqual({x: 50 , y: 60});
  });

  it('.calculateLensPosition should calculate a valid position', () => {
    const eventFake = new MouseEvent('mousemove');

    const imgFake: HTMLImageElement = new Image(1000, 800);

    const lensFake: Partial<HTMLDivElement> = {
      offsetWidth: 100,
      offsetHeight: 100
    };

    const positionFake = {x: 200, y: 200};

    spyOn<any>(zoomViewManager, 'getCursorPosition').and.returnValue(positionFake);

    const result = zoomViewManager.callCalculateLensPosition(eventFake, imgFake, lensFake as HTMLDivElement);

    expect(result).toEqual({x: 150 , y: 150});
  });

  it('.calculateLensPosition should prevent the lens from been positioned outside the image (top and right)', () => {
    const eventFake = new MouseEvent('mousemove');

    const imgFake: HTMLImageElement = new Image(1000, 800);

    const lensFake: Partial<HTMLDivElement> = {
      offsetWidth: 100,
      offsetHeight: 100
    };

    const positionFake = {x: 950, y: 750};

    spyOn<any>(zoomViewManager, 'getCursorPosition').and.returnValue(positionFake);

    const result = zoomViewManager.callCalculateLensPosition(eventFake, imgFake, lensFake as HTMLDivElement);

    expect(result).toEqual({x: 900 , y: 700});
  });

  it('.calculateLensPosition should prevent the lens from been positioned outside the image (bottom and left)', () => {
    const eventFake = new MouseEvent('mousemove');

    const imgFake: HTMLImageElement = new Image(1000, 800);

    const lensFake: Partial<HTMLDivElement> = {
      offsetWidth: 100,
      offsetHeight: 100
    };

    const positionFake = {x: 50, y: 50};

    spyOn<any>(zoomViewManager, 'getCursorPosition').and.returnValue(positionFake);

    const result = zoomViewManager.callCalculateLensPosition(eventFake, imgFake, lensFake as HTMLDivElement);

    expect(result).toEqual({x: 0 , y: 0});
  });

  it('.isReady should evaluate to true if the image is loaded and the component initialized', () => {

    zoomViewManager['isImageLoaded'] = true;
    zoomViewManager['isInitialized'] = true;

    const isReady = zoomViewManager.isReady;

    expect(isReady).toBeTrue();

  });

  it('.isReady should evaluate to false if the image is not loaded', () => {

    zoomViewManager['isImageLoaded'] = false;
    zoomViewManager['isInitialized'] = true;

    const isReady = zoomViewManager.isReady;

    expect(isReady).toBeFalse();

  });

  it('.isReady should evaluate to false if the component is not initialized', () => {

    zoomViewManager['isImageLoaded'] = true;
    zoomViewManager['isInitialized'] = false;

    const isReady = zoomViewManager.isReady;

    expect(isReady).toBeFalse();

  });
});
