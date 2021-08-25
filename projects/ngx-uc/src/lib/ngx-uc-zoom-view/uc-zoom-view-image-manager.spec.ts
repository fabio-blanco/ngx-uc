import { UcZoomViewImageManager } from './uc-zoom-view-image-manager';
import {ElementRef, Renderer2, RendererStyleFlags2} from "@angular/core";
import {UC_ZOOM_VIEW_DEFAULT_CONFIG, UcZoomViewConfig} from "./uc-zoom-view-config";
import {UcZoomViewEventCallbacks} from "./uc-zoom-view-events";

describe('UcZoomViewImageManager', () => {

  let image: HTMLImageElement;
  let zoomViewManager: UcZoomViewImageManager;
  let rendererStub = <Renderer2>{
    parentNode(node: any): any {},
    createElement(name: string, namespace?: string | null): any {},
    addClass(el: any, name: string) {},
    insertBefore(parent: any, newChild: any, refChild: any, isMove?: boolean) {},
    removeChild(parent: any, oldChild: any, isHostElement?: boolean) {},
    appendChild(parent: any, newChild: any) {},
    removeClass(el: any, name: string) {},
    setStyle(el: any, style: string, value: any, flags?: RendererStyleFlags2) {},
    removeStyle(el: any, style: string, flags?: RendererStyleFlags2) {},
    listen(target: any, eventName: string, callback: (event: any) => (boolean | void)): () => void {return () => {}}
  };
  let eventCallbacks: UcZoomViewEventCallbacks = {
    lensPositionUpdateEvent: coordinates => {},
    readyEvent: readyEvent => {},
    zoomStarted: () => {},
    zoomEnded: () => {},
    imageSourceChanged: event => {},
    resizeLensDimensions: event => {}
  };

  beforeEach(() => {
    image = new Image(100,200);
    const elRef: ElementRef = new ElementRef(image);
    zoomViewManager = new UcZoomViewImageManager(elRef, rendererStub, null, undefined, eventCallbacks);
  });

  it('should create an instance', () => {
    expect(zoomViewManager).toBeTruthy();
  });

  it('.image should properly return the root image element', () => {
    let returnedImage = zoomViewManager.image;
    expect(returnedImage).toBeTruthy();
    expect(returnedImage.tagName).toBeTruthy();
    expect(returnedImage.tagName.toLowerCase()).toBe('img');
    expect(returnedImage).toBe(image);
  });

  function prepareInitializeViewerTests(): void {
    spyOn(zoomViewManager, 'getNativeElement').and.returnValue(image);

    const wrapperDiv = document.createElement('div');
    spyOn<any>(zoomViewManager, 'wrapImage').and.returnValue(wrapperDiv);
    spyOn<any>(zoomViewManager, 'attachListenersToImage');
    spyOn<any>(zoomViewManager, 'initializeLensAndResult');
    spyOn(zoomViewManager['eventCallbacks'], 'readyEvent');
  }

  it('.initializeViewer should wrap image, attach listeners, initialize lens and result, and become initialized', () => {
    prepareInitializeViewerTests();
    spyOn<any>(zoomViewManager, 'isImageAlreadyLoaded').and.returnValue(true);

    zoomViewManager.initializeViewer();

    expect(zoomViewManager['wrapImage']).toHaveBeenCalledOnceWith(image);
    expect(zoomViewManager['attachListenersToImage']).toHaveBeenCalledOnceWith(image);
    expect(zoomViewManager['initializeLensAndResult']).toHaveBeenCalledOnceWith(image);
    expect(zoomViewManager['isInitialized']).toBeTruthy();
    expect(zoomViewManager['outerDiv']).toBeDefined();
    expect(zoomViewManager['eventCallbacks'].readyEvent).toHaveBeenCalled();
  });

  it('.initializeViewer should not emit ready event if image is not yet loaded', () => {
    prepareInitializeViewerTests();
    spyOn<any>(zoomViewManager, 'isImageAlreadyLoaded').and.returnValue(false);

    zoomViewManager.initializeViewer();

    expect(zoomViewManager['eventCallbacks'].readyEvent).not.toHaveBeenCalled();
  });

  it('.destroy should perform a cleaning on the state of the manager', () => {

    spyOn<any>(zoomViewManager, 'unWrapImage');
    spyOn(zoomViewManager['srcMutationObserver'], 'disconnect').and.callThrough();
    spyOn(zoomViewManager['imageResizeObserver'], 'disconnect').and.callThrough();

    zoomViewManager['unListeners'] = [];

    let isAllUnlistenersCalled = false;
    zoomViewManager['unListeners'].push(() => isAllUnlistenersCalled=true);
    zoomViewManager['unListeners'].push(() => {if(isAllUnlistenersCalled) isAllUnlistenersCalled=true});

    zoomViewManager.destroy();

    expect(zoomViewManager['unWrapImage']).toHaveBeenCalledWith(image);
    expect(isAllUnlistenersCalled).toBeTrue();
    expect(zoomViewManager['srcMutationObserver'].disconnect).toHaveBeenCalled();
    expect(zoomViewManager['imageResizeObserver'].disconnect).toHaveBeenCalled();

  });

  it('.attachListenersToImage should attach the listeners to the given image', () => {
    const originalUnListeners = zoomViewManager['unListeners'];

    zoomViewManager['unListeners'] = [];

    spyOn(rendererStub, 'listen').and.callThrough();
    spyOn(zoomViewManager['srcMutationObserver'], 'observe');
    spyOn(zoomViewManager['imageResizeObserver'], 'observe');

    zoomViewManager['attachListenersToImage'](image);

    expect(rendererStub.listen).toHaveBeenCalledWith(image, 'mousemove',jasmine.any(Function));
    expect(rendererStub.listen).toHaveBeenCalledWith(image, 'mouseenter',jasmine.any(Function));
    expect(rendererStub.listen).toHaveBeenCalledWith(image, 'load',jasmine.any(Function));
    expect(rendererStub.listen).toHaveBeenCalledWith(image, 'error',jasmine.any(Function));
    expect(rendererStub.listen).toHaveBeenCalledTimes(4);
    expect(zoomViewManager['unListeners'].length).toBe(4);
    expect(zoomViewManager['srcMutationObserver'].observe).toHaveBeenCalled();
    expect(zoomViewManager['imageResizeObserver'].observe).toHaveBeenCalled();

    zoomViewManager['unListeners'] = originalUnListeners;
  });

  it('.attachListenersToImage should not initiate imageResizeObserver if automatic resize is turned off', () => {

    zoomViewManager['config'].lensOptions.automaticResize = false;

    spyOn(rendererStub, 'listen');
    spyOn(zoomViewManager['srcMutationObserver'], 'observe');
    spyOn(zoomViewManager['imageResizeObserver'], 'observe');

    zoomViewManager['attachListenersToImage'](image);

    expect(zoomViewManager['imageResizeObserver'].observe).not.toHaveBeenCalled();
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

    zoomViewManager['initializeZoomDiv'](imgStub);

    expect(zoomViewManager['setZoomViewResultImage']).toHaveBeenCalledOnceWith(imgStub);
    expect(zoomViewManager['initializeZoomDivBackgroundSize']).toHaveBeenCalledOnceWith(imgStub);
    expect(rendererStub.addClass).toHaveBeenCalledOnceWith(zoomResultDiv, UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens);
  });

  it('.initializeZoomDiv should not add class on zoomResult if external view is set', () => {

    const imgStub: Partial<HTMLImageElement> = {
      src: 'anyimage.jpeg',
      width: 10,
      height: 10
    };

    const elRef: ElementRef = new ElementRef(image);
    let zoomViewImageManager = new UcZoomViewImageManager(elRef, rendererStub, {}, undefined, eventCallbacks);

    spyOn<any>(zoomViewImageManager, 'setZoomViewResultImage');
    spyOn<any>(zoomViewImageManager, 'initializeZoomDivBackgroundSize');
    spyOn(rendererStub, 'addClass');

    zoomViewImageManager['initializeZoomDiv'](imgStub as HTMLImageElement);

    expect(rendererStub.addClass).not.toHaveBeenCalled();
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

    zoomViewManager['initializeZoomDiv'](imgStub);

    expect(zoomViewManager['initializeZoomDivBackgroundSize']).not.toHaveBeenCalled();
  });

  it('.initializeLens should hide and attach mousemove and mouseenter listeners', () => {
    const img: HTMLImageElement = new Image(10, 10);

    const lensDiv = document.createElement('div');
    zoomViewManager['lens'] = lensDiv;

    spyOn(rendererStub, 'addClass');
    spyOn(rendererStub, 'listen');

    zoomViewManager['initializeLens'](img);

    expect(rendererStub.addClass).toHaveBeenCalledOnceWith(lensDiv, UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens);
    expect(rendererStub.listen).toHaveBeenCalledWith(lensDiv, 'mousemove', jasmine.any(Function));
    expect(rendererStub.listen).toHaveBeenCalledWith(lensDiv, 'mouseleave', jasmine.any(Function));
    expect(rendererStub.listen).toHaveBeenCalledTimes(2);
  });

  it('.setExternalZoomResultContainer should initialize the zoom result view with the external result view', () => {
    const customZoomResultDiv = document.createElement('div');
    const elRef: ElementRef = new ElementRef(image);
    let zoomViewImageManager = new UcZoomViewImageManager(elRef, rendererStub, customZoomResultDiv, undefined, eventCallbacks);

    (zoomViewImageManager as any).setExternalZoomResultContainer();

    expect(zoomViewImageManager['zoomResult']).toBe(customZoomResultDiv);
  });

  it('.setExternalZoomResultContainer should not accept a result view that is not a div', () => {
    const elRef: ElementRef = new ElementRef(image);
    let zoomViewImageManager = new UcZoomViewImageManager(elRef, rendererStub, image, undefined, eventCallbacks);

    expect( () => {(zoomViewImageManager as any).setExternalZoomResultContainer()}).toThrow(new TypeError('The view object is not a div. A custom zoom view should be a div.'));
  });

  it('.onImageResized should resize lens and adjust zoom view position', () => {
    zoomViewManager['isImageLoaded'] = true;
    zoomViewManager['isInitialized'] = true;

    const zoomResultDiv = document.createElement('div');
    zoomViewManager['zoomResult'] = zoomResultDiv;

    spyOn<any>(zoomViewManager, 'resizeLens');
    spyOn<any>(zoomViewManager, 'setViewPosition');

    (zoomViewManager as any).onImageResized();

    expect(zoomViewManager['resizeLens']).toHaveBeenCalled();
    expect(zoomViewManager['setViewPosition']).toHaveBeenCalledOnceWith(zoomResultDiv, image);
  });

  it('.onImageResized should do nothing if not ready', () => {
    zoomViewManager['isImageLoaded'] = false;

    spyOn<any>(zoomViewManager, 'resizeLens');
    spyOn<any>(zoomViewManager, 'setViewPosition');

    (zoomViewManager as any).onImageResized();

    expect(zoomViewManager['resizeLens']).not.toHaveBeenCalled();
    expect(zoomViewManager['setViewPosition']).not.toHaveBeenCalled();
  });

  it('.onImageResized should not resize the lens if automatic resize is turned off', () => {
    const config: UcZoomViewConfig = {
      lensOptions: {
        automaticResize: false
      }
    }

    const elRef: ElementRef = new ElementRef(image);
    let zoomViewImageManager = new UcZoomViewImageManager(elRef, rendererStub, undefined, config, eventCallbacks);

    zoomViewImageManager['isImageLoaded'] = true;
    zoomViewImageManager['isInitialized'] = true;

    const zoomResultDiv = document.createElement('div');
    zoomViewImageManager['zoomResult'] = zoomResultDiv;

    spyOn<any>(zoomViewImageManager, 'resizeLens');
    spyOn<any>(zoomViewImageManager, 'setViewPosition');

    (zoomViewImageManager as any).onImageResized();

    expect(zoomViewImageManager['resizeLens']).not.toHaveBeenCalled();
    expect(zoomViewImageManager['setViewPosition']).toHaveBeenCalledOnceWith(zoomResultDiv, image);
  });

  function prepareInitializeLensAndResultTest(imageFullyLoaded: boolean = true): {lensDiv: HTMLDivElement, zoomResultDiv: HTMLDivElement} {
    const zoomResultDiv = document.createElement('div');
    const lensDiv = document.createElement('div');

    spyOn<any>(zoomViewManager, 'createZoomResultContainer').and.returnValue(zoomResultDiv);
    spyOn<any>(zoomViewManager, 'creatLens').and.returnValue(lensDiv);

    spyOn<any>(zoomViewManager, 'calculateRatioBetweenResultAndLens');
    spyOn<any>(zoomViewManager, 'isImageAlreadyLoaded').and.returnValue(imageFullyLoaded);
    spyOn<any>(zoomViewManager, 'initializeLensDimensions');
    spyOn<any>(zoomViewManager, 'initializeZoomDiv');
    spyOn<any>(zoomViewManager, 'initializeLens');

    return {lensDiv: lensDiv, zoomResultDiv: zoomResultDiv};
  }

  it('.initializeLensAndResult should initialize lens and zoom result', () => {
    const {lensDiv, zoomResultDiv} = prepareInitializeLensAndResultTest();

    zoomViewManager['isImageLoaded'] = true;

    zoomViewManager['initializeLensAndResult'](image);

    expect(zoomViewManager['zoomResult']).toBe(zoomResultDiv);
    expect(zoomViewManager['lens']).toBe(lensDiv);
    expect(zoomViewManager['calculateRatioBetweenResultAndLens']).toHaveBeenCalled();
    expect(zoomViewManager['initializeLensDimensions']).toHaveBeenCalledOnceWith(image);
    expect(zoomViewManager['initializeZoomDiv']).toHaveBeenCalledOnceWith(image);
    expect(zoomViewManager['initializeLens']).toHaveBeenCalledOnceWith(image);
  });

  it('.initializeLensAndResult should not deal with lens dimensions based on proportion if image not loaded', () => {
    prepareInitializeLensAndResultTest(false);

    zoomViewManager['isImageLoaded'] = false;

    zoomViewManager['initializeLensAndResult'](image);

    expect(zoomViewManager['initializeLensDimensions']).not.toHaveBeenCalled();
  });

  function prepareInitializeLensAndResultCustomView(zoomViewImageManager: UcZoomViewImageManager){

    const lensDiv = document.createElement('div');

    zoomViewManager['isImageLoaded'] = false;

    spyOn<any>(zoomViewImageManager, 'setExternalZoomResultContainer').and.callThrough();
    spyOn<any>(zoomViewImageManager, 'createZoomResultContainer');
    spyOn<any>(zoomViewImageManager, 'creatLens').and.returnValue(lensDiv);

    spyOn<any>(zoomViewImageManager, 'calculateRatioBetweenResultAndLens');
    spyOn<any>(zoomViewManager, 'isImageAlreadyLoaded').and.returnValue(true);
    spyOn<any>(zoomViewImageManager, 'initializeZoomDiv');
    spyOn<any>(zoomViewImageManager, 'initializeLens');
  }

  it('.initializeLensAndResult should properly initialize a custom zoom result view', () => {
    const customZoomResultDiv = document.createElement('div');
    const elRef: ElementRef = new ElementRef(image);
    let zoomViewImageManager = new UcZoomViewImageManager(elRef, rendererStub, customZoomResultDiv, undefined, eventCallbacks);

    prepareInitializeLensAndResultCustomView(zoomViewImageManager);

    zoomViewImageManager['initializeLensAndResult'](image);

    expect(zoomViewImageManager['zoomResult']).toBe(customZoomResultDiv);
    expect(zoomViewImageManager['setExternalZoomResultContainer']).toHaveBeenCalled();
    expect(zoomViewImageManager['createZoomResultContainer']).not.toHaveBeenCalled();
    expect(zoomViewImageManager['initializeZoomDiv']).not.toHaveBeenCalledOnceWith(image);
  });

  it('.initializeLensAndResult should properly initialize a custom zoom result with resetExtViewOnMouseLeave off', () => {
    const customZoomResultDiv = document.createElement('div');
    const elRef: ElementRef = new ElementRef(image);
    const config: UcZoomViewConfig = {resetExtViewOnMouseLeave: false};
    let zoomViewImageManager = new UcZoomViewImageManager(elRef, rendererStub, customZoomResultDiv, config, eventCallbacks);

    prepareInitializeLensAndResultCustomView(zoomViewImageManager);

    zoomViewImageManager['initializeLensAndResult'](image);

    expect(zoomViewImageManager['zoomResult']).toBe(customZoomResultDiv);
    expect(zoomViewImageManager['setExternalZoomResultContainer']).toHaveBeenCalled();
    expect(zoomViewImageManager['createZoomResultContainer']).not.toHaveBeenCalled();
    expect(zoomViewImageManager['initializeZoomDiv']).toHaveBeenCalled();
  });

  it('.initializeLensDimensions should calculate lens proportion and update lens dimensions', () => {
    const lensDiv = document.createElement('div');

    spyOn<any>(zoomViewManager, 'calculateLensDimensionsProportion').and.returnValue(0.5);
    spyOn<any>(zoomViewManager, 'updateLensDimensions');

    zoomViewManager['config'].lensOptions.sizeProportion = 0.5;
    zoomViewManager['lens'] = lensDiv;

    zoomViewManager['initializeLensDimensions'](image);

    expect(zoomViewManager['calculateLensDimensionsProportion']).toHaveBeenCalledOnceWith(image, lensDiv);
    expect(zoomViewManager['lensSizeProportion']).toBe(0.5);
    expect(zoomViewManager['updateLensDimensions']).toHaveBeenCalledOnceWith(image);
  });

  it('.initializeLensDimensions should not update lens dimensions if size proportion inferred', () => {
    spyOn<any>(zoomViewManager, 'calculateLensDimensionsProportion').and.returnValue(0.5);
    spyOn<any>(zoomViewManager, 'updateLensDimensions');

    zoomViewManager['config'].lensOptions.sizeProportion = 'inferred';

    zoomViewManager['initializeLensDimensions'](image);

    expect(zoomViewManager['updateLensDimensions']).not.toHaveBeenCalled();
  });

  it('.initializeLensDimensions should not update lens dimensions if automatic resize is turned off', () => {
    spyOn<any>(zoomViewManager, 'calculateLensDimensionsProportion').and.returnValue(0.5);
    spyOn<any>(zoomViewManager, 'updateLensDimensions');

    zoomViewManager['config'].lensOptions.sizeProportion = 0.2;
    zoomViewManager['config'].lensOptions.automaticResize = false;

    zoomViewManager['initializeLensDimensions'](image);

    expect(zoomViewManager['updateLensDimensions']).not.toHaveBeenCalled();
  });

  function prepereOnImageSourceChangeTest(img: HTMLImageElement): UcZoomViewImageManager {
    const elRef: ElementRef = new ElementRef(img);
    let zoomViewImageManager = new UcZoomViewImageManager(elRef, rendererStub, undefined, undefined, eventCallbacks);

    spyOn(zoomViewImageManager, 'getNativeElement').and.callThrough();
    spyOn<any>(zoomViewImageManager, 'setZoomViewResultImage');
    spyOn<any>(zoomViewImageManager, 'initializeZoomDivBackgroundSize');
    spyOn(zoomViewImageManager['eventCallbacks'], 'imageSourceChanged');

    return zoomViewImageManager;
  }

  it('.onImageSourceChange should update the zoom view image and emit the imageSourceChange event', () => {
    const img = {
      src: 'new-image.jpg',
      tagName: 'IMG'
    } as HTMLImageElement;

    let zoomViewImageManager = prepereOnImageSourceChangeTest(img);

    const oldValue = 'any-image.jpg';

    (zoomViewImageManager as any).onImageSourceChange(oldValue);

    expect(zoomViewImageManager['getNativeElement']).toHaveBeenCalled();
    expect(zoomViewImageManager['setZoomViewResultImage']).toHaveBeenCalledOnceWith(img)
    expect(zoomViewImageManager['initializeZoomDivBackgroundSize']).toHaveBeenCalledOnceWith(img);
    expect(zoomViewImageManager['eventCallbacks'].imageSourceChanged).toHaveBeenCalledOnceWith(jasmine.objectContaining({
      newValue: img.src,
      oldValue: oldValue
    }));
  });

  function prepareUnwrapImageTest(zoomViewImageManager: UcZoomViewImageManager) {
    spyOn(rendererStub, 'removeChild');

    const parent = document.body;
    spyOn(rendererStub, 'parentNode').and.returnValue(parent);
    spyOn(rendererStub, 'insertBefore');

    zoomViewImageManager['outerDiv'] = document.createElement('div');
    zoomViewImageManager['outerDiv'].id = 'outerDiv'; //To differentiate the div
    zoomViewImageManager['lens'] = document.createElement('div');
    zoomViewImageManager['zoomResult'] = document.createElement('div');
    zoomViewImageManager['zoomResult'].id = 'zoomResult'; //To differentiate the div

    return parent;
  }

  it('.unWrapImage should unwrap the image letting it in the state it was before wrapped', () => {

    const parent = prepareUnwrapImageTest(zoomViewManager);

    (zoomViewManager as any).unWrapImage(image);

    expect(rendererStub.removeChild).toHaveBeenCalledWith(zoomViewManager['outerDiv'], image);
    expect(rendererStub.removeChild).toHaveBeenCalledWith(zoomViewManager['outerDiv'], zoomViewManager['lens']);
    expect(rendererStub.removeChild).toHaveBeenCalledWith(zoomViewManager['outerDiv'], zoomViewManager['zoomResult']);
    expect(rendererStub.parentNode).toHaveBeenCalledWith(zoomViewManager['outerDiv']);
    expect(rendererStub.insertBefore).toHaveBeenCalledWith(parent, image, zoomViewManager['outerDiv'], true);
    expect(rendererStub.removeChild).toHaveBeenCalledWith(parent, zoomViewManager['outerDiv']);

  });

  it('.unWrapImage should not touch the external zoom view', () => {
    const elRef: ElementRef = new ElementRef(image);
    let zoomViewImageManager = new UcZoomViewImageManager(elRef, rendererStub, {}, undefined, eventCallbacks);

    prepareUnwrapImageTest(zoomViewImageManager);

    (zoomViewImageManager as any).unWrapImage(image);

    expect(rendererStub.removeChild).not.toHaveBeenCalledWith(zoomViewImageManager['outerDiv'], zoomViewImageManager['zoomResult']);

  });

  it('.onImageLoaded should initialize the background image size of the zoom div and the lens dimensions and set the isImageLoaded flag', ()=> {

    (zoomViewManager['lensSizeProportion'] as any) = undefined;

    spyOn<any>(zoomViewManager, 'initializeLensDimensions');
    spyOn<any>(zoomViewManager, 'initializeZoomDivBackgroundSize');
    spyOn(zoomViewManager['eventCallbacks'], 'readyEvent');
    zoomViewManager['isInitialized'] = true;

    zoomViewManager['onImageLoaded'](image);

    expect(zoomViewManager['initializeLensDimensions']).toHaveBeenCalledOnceWith(image);
    expect(zoomViewManager['initializeZoomDivBackgroundSize']).toHaveBeenCalledOnceWith(image);
    expect(zoomViewManager['isImageLoaded']).toBeTrue();
    expect(zoomViewManager['eventCallbacks'].readyEvent).toHaveBeenCalled();
  });

  it('.onImageLoaded should not initialize the lens dimensions if lens size proportion was already calculated', ()=> {

    zoomViewManager['lensSizeProportion'] = 0.3;

    spyOn<any>(zoomViewManager, 'initializeLensDimensions');
    spyOn<any>(zoomViewManager, 'initializeZoomDivBackgroundSize');

    zoomViewManager['onImageLoaded'](image);

    expect(zoomViewManager['initializeLensDimensions']).not.toHaveBeenCalled();

  });

  it('.onImageLoaded should not emit ready event if the component is not initialized yet', ()=> {
    spyOn<any>(zoomViewManager, 'initializeLensDimensions');
    spyOn<any>(zoomViewManager, 'initializeZoomDivBackgroundSize');
    spyOn(zoomViewManager['eventCallbacks'], 'readyEvent');
    zoomViewManager['isInitialized'] = false;

    zoomViewManager['onImageLoaded'](image);

    expect(zoomViewManager['eventCallbacks'].readyEvent).not.toHaveBeenCalled();
  });

  it('.onImgMouseMove should do nothing if not ready', () => {
    const eventFake = new MouseEvent('mousemove');

    zoomViewManager['isImageLoaded'] = false;

    spyOn<any>(zoomViewManager, 'calculateLensPosition');

    zoomViewManager['onImgMouseMove'](eventFake);

    expect(zoomViewManager['calculateLensPosition']).not.toHaveBeenCalled();

  });

  it('.onImgMouseMove should do nothing if turned off', () => {
    const eventFake = new MouseEvent('mousemove');

    zoomViewManager['isImageLoaded'] = true;
    zoomViewManager.turnedOn = false;

    spyOn<any>(zoomViewManager, 'calculateLensPosition');

    zoomViewManager['onImgMouseMove'](eventFake);

    expect(zoomViewManager['calculateLensPosition']).not.toHaveBeenCalled();

  });

  it('.onImgMouseMove should use given image instead of event target when available', () => {
    const eventImgDummy: HTMLImageElement = new Image(10, 10);
    const otherImgDummy: HTMLImageElement = new Image(20, 20);

    const eventFake = new MouseEvent('mousemove', {relatedTarget: eventImgDummy});

    zoomViewManager['isImageLoaded'] = true;
    zoomViewManager['isInitialized'] = true;
    const lensDiv = document.createElement('div');
    zoomViewManager['lens'] = lensDiv;

    spyOn<any>(zoomViewManager, 'calculateLensPosition').and.returnValue({x: 5, y: 5});

    spyOn(rendererStub, 'setStyle');

    (zoomViewManager as any).onImgMouseMove(eventFake, otherImgDummy);

    expect(zoomViewManager['calculateLensPosition']).toHaveBeenCalledOnceWith(eventFake, otherImgDummy, lensDiv);
  });

  it('.onImgMouseMove should use image provided by event if no other image is provided', () => {
    const eventImgDummy: HTMLImageElement = new Image(10, 10);

    const eventFake: MouseEvent = {
      target: eventImgDummy,
      preventDefault: () => {}
    } as any;

    zoomViewManager['isImageLoaded'] = true;
    zoomViewManager['isInitialized'] = true;
    const lensDiv = document.createElement('div');
    zoomViewManager['lens'] = lensDiv;

    spyOn<any>(zoomViewManager, 'calculateLensPosition').and.returnValue({x: 5, y: 5});

    spyOn(rendererStub, 'setStyle');

    zoomViewManager['onImgMouseMove'](eventFake);

    expect(zoomViewManager['calculateLensPosition']).toHaveBeenCalledOnceWith(eventFake, eventImgDummy, lensDiv);
  });

  it('.onImgMouseMove should sets the position of the lens and the zoom background position according to the given mouse event', () => {
    const eventImgDummy: HTMLImageElement = new Image(10, 10);

    let preventDefaultCalled = false;
    const eventFake: MouseEvent = {
      target: eventImgDummy,
      preventDefault: () => {preventDefaultCalled = true}
    } as any;

    zoomViewManager['isImageLoaded'] = true;
    zoomViewManager['isInitialized'] = true;

    zoomViewManager['cx'] = 2;
    zoomViewManager['cy'] = 3;

    const lensDiv = document.createElement('div');
    zoomViewManager['lens'] = lensDiv;
    const zoomResultDiv = document.createElement('div');
    zoomViewManager['zoomResult'] = zoomResultDiv;

    spyOn(rendererStub, 'setStyle');

    spyOn<any>(zoomViewManager, 'calculateLensPosition').and.returnValue({x: 10, y: 20});

    zoomViewManager['onImgMouseMove'](eventFake);

    expect(zoomViewManager['calculateLensPosition']).toHaveBeenCalledOnceWith(eventFake, eventImgDummy, zoomViewManager['lens']);
    expect(rendererStub.setStyle).toHaveBeenCalledWith(lensDiv, 'left', '10px');
    expect(rendererStub.setStyle).toHaveBeenCalledWith(lensDiv, 'top', '20px');
    expect(rendererStub.setStyle).toHaveBeenCalledWith(zoomResultDiv, 'background-position', '-20px -60px');
  });

  it('.onImgMouseMove should emmit lens position', () => {
    const eventImgDummy: HTMLImageElement = new Image(10, 10);

    const eventFake: MouseEvent = {
      target: eventImgDummy,
      preventDefault: () => {}
    } as any;

    zoomViewManager['isImageLoaded'] = true;
    zoomViewManager['isInitialized'] = true;
    const lensDiv = document.createElement('div');
    zoomViewManager['lens'] = lensDiv;

    const dummyPosition = {x: 5, y: 6};

    spyOn<any>(zoomViewManager, 'calculateLensPosition').and.returnValue(dummyPosition);

    spyOn(rendererStub, 'setStyle');

    spyOn<any>(zoomViewManager['eventCallbacks'], 'lensPositionUpdateEvent');

    zoomViewManager['onImgMouseMove'](eventFake);

    expect(zoomViewManager['calculateLensPosition']).toHaveBeenCalledOnceWith(eventFake, eventImgDummy, lensDiv);
    expect(zoomViewManager['eventCallbacks'].lensPositionUpdateEvent).toHaveBeenCalledOnceWith(dummyPosition);
  });

  it('.onImgMouseEnter should do nothing if not initialized', () => {
    const eventFake = new MouseEvent('mousemove');

    zoomViewManager['isImageLoaded'] = false;

    spyOn(rendererStub, 'removeClass');
    spyOn(zoomViewManager['eventCallbacks'], 'zoomStarted');

    (zoomViewManager as any).onImgMouseEnter(eventFake);

    expect(rendererStub.removeClass).not.toHaveBeenCalled();
    expect(zoomViewManager['eventCallbacks'].zoomStarted).not.toHaveBeenCalled();
  });

  it('.onImgMouseEnter should do nothing on component turned off', () => {
    const eventFake = new MouseEvent('mousemove');

    zoomViewManager['isImageLoaded'] = true;
    zoomViewManager.turnedOn = false;

    spyOn(rendererStub, 'removeClass');
    spyOn(zoomViewManager['eventCallbacks'], 'zoomStarted');

    (zoomViewManager as any).onImgMouseEnter(eventFake);

    expect(rendererStub.removeClass).not.toHaveBeenCalled();
    expect(zoomViewManager['eventCallbacks'].zoomStarted).not.toHaveBeenCalled();
  });

  it('.onImgMouseEnter should display lens and zoom result and emit zoomStarted event', () => {
    const eventFake = new MouseEvent('mousemove');

    zoomViewManager['isImageLoaded'] = true;
    zoomViewManager['isInitialized'] = true;

    zoomViewManager['lens'] = document.createElement('div');
    zoomViewManager['zoomResult'] = document.createElement('div');

    spyOn(rendererStub, 'removeClass');
    spyOn(zoomViewManager['eventCallbacks'], 'zoomStarted');

    (zoomViewManager as any).onImgMouseEnter(eventFake);

    expect(rendererStub.removeClass).toHaveBeenCalledWith(zoomViewManager['lens'], UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens);
    expect(rendererStub.removeClass).toHaveBeenCalledWith(zoomViewManager['zoomResult'], UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens);
    expect(zoomViewManager['eventCallbacks'].zoomStarted).toHaveBeenCalled();
  });

  it('.onImgMouseEnter should not try to display the external zoom view', () => {
    const eventFake = new MouseEvent('mousemove');

    zoomViewManager['isImageLoaded'] = true;
    zoomViewManager['isInitialized'] = true;

    zoomViewManager['zoomResult'] = document.createElement('div');
    zoomViewManager['ucZoomResultView'] = {};

    spyOn(rendererStub, 'removeClass');

    (zoomViewManager as any).onImgMouseEnter(eventFake);

    expect(rendererStub.removeClass).not.toHaveBeenCalledWith(zoomViewManager['zoomResult'], jasmine.any(Object));
  });

  it('.onImgMouseEnter should prepare the external zoom view if resetExtViewOnMouseLeave is turned on', () => {
    const eventFake = new MouseEvent('mousemove');

    zoomViewManager['isImageLoaded'] = true;
    zoomViewManager['isInitialized'] = true;

    zoomViewManager['zoomResult'] = document.createElement('div');
    zoomViewManager['ucZoomResultView'] = {};

    const imgDummy: HTMLImageElement = new Image(10, 10);

    spyOn(rendererStub, 'addClass');
    spyOn<any>(zoomViewManager, 'getNativeElement').and.returnValue(imgDummy);
    spyOn<any>(zoomViewManager, 'initializeZoomDiv');

    (zoomViewManager as any).onImgMouseEnter(eventFake);

    expect(zoomViewManager['initializeZoomDiv']).toHaveBeenCalledOnceWith(imgDummy);
  });

  it('.onImgMouseEnter should not prepare the external zoom view if resetExtViewOnMouseLeave is turned off', () => {
    const eventFake = new MouseEvent('mousemove');

    zoomViewManager['isImageLoaded'] = true;
    zoomViewManager['isInitialized'] = true;

    zoomViewManager['zoomResult'] = document.createElement('div');
    zoomViewManager['ucZoomResultView'] = {};

    spyOn(rendererStub, 'addClass');
    spyOn<any>(zoomViewManager, 'initializeZoomDiv');

    zoomViewManager['config'].resetExtViewOnMouseLeave = false;

    (zoomViewManager as any).onImgMouseEnter(eventFake);

    expect(zoomViewManager['initializeZoomDiv']).not.toHaveBeenCalled();
  });

  it('.onImgMouseLeave should do nothing if not ready', () => {
    const eventFake = new MouseEvent('mousemove');

    zoomViewManager['isImageLoaded'] = false;

    spyOn(rendererStub, 'addClass');
    spyOn(zoomViewManager['eventCallbacks'], 'zoomEnded');

    (zoomViewManager as any).onImgMouseLeave(eventFake);

    expect(rendererStub.addClass).not.toHaveBeenCalled();
    expect(zoomViewManager['eventCallbacks'].zoomEnded).not.toHaveBeenCalled();
  });

  it('.onImgMouseLeave should hide lens and zoom result and emit zoomEnded event', () => {
    const eventFake = new MouseEvent('mousemove');

    zoomViewManager['isImageLoaded'] = true;
    zoomViewManager['isInitialized'] = true;

    zoomViewManager['lens'] = document.createElement('div');
    zoomViewManager['zoomResult'] = document.createElement('div');

    spyOn(rendererStub, 'addClass');
    spyOn(zoomViewManager['eventCallbacks'], 'zoomEnded');

    (zoomViewManager as any).onImgMouseLeave(eventFake);

    expect(rendererStub.addClass).toHaveBeenCalledWith(zoomViewManager['lens'], UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens);
    expect(rendererStub.addClass).toHaveBeenCalledWith(zoomViewManager['zoomResult'], UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens);
    expect(zoomViewManager['eventCallbacks'].zoomEnded).toHaveBeenCalled();
  });

  it('.onImgMouseLeave should not try to hide the external zoom view', () => {
    const eventFake = new MouseEvent('mousemove');

    zoomViewManager['isImageLoaded'] = true;
    zoomViewManager['isInitialized'] = true;

    zoomViewManager['zoomResult'] = document.createElement('div');
    zoomViewManager['ucZoomResultView'] = {};

    spyOn(rendererStub, 'addClass');

    (zoomViewManager as any).onImgMouseLeave(eventFake);

    expect(rendererStub.addClass).not.toHaveBeenCalledWith(zoomViewManager['zoomResult'], jasmine.any(Object));
  });

  it('.onImgMouseLeave should reset the external zoom view if resetExtViewOnMouseLeave is turned on', () => {
    const eventFake = new MouseEvent('mousemove');

    zoomViewManager['isImageLoaded'] = true;
    zoomViewManager['isInitialized'] = true;

    zoomViewManager['zoomResult'] = document.createElement('div');
    zoomViewManager['ucZoomResultView'] = {};

    spyOn(rendererStub, 'addClass');

    (zoomViewManager as any).onImgMouseLeave(eventFake);

    expect(zoomViewManager['zoomResult'].style.backgroundImage).toBeFalsy();
    expect(zoomViewManager['zoomResult'].style.backgroundSize).toBeFalsy();
    expect(zoomViewManager['zoomResult'].style.backgroundPosition).toBeFalsy();
  });

  it('.onImgMouseLeave should not reset the external zoom view if resetExtViewOnMouseLeave is turned off', () => {
    const eventFake = new MouseEvent('mousemove');

    zoomViewManager['isImageLoaded'] = true;
    zoomViewManager['isInitialized'] = true;

    zoomViewManager['zoomResult'] = document.createElement('div');
    zoomViewManager['ucZoomResultView'] = {};

    spyOn(rendererStub, 'addClass');
    spyOn<any>(zoomViewManager, 'resetZoomView');

    zoomViewManager['config'].resetExtViewOnMouseLeave = false;

    (zoomViewManager as any).onImgMouseLeave(eventFake);

    expect(zoomViewManager['resetZoomView']).not.toHaveBeenCalled();
  });

  it('.image should return the image object of this component', () => {
    expect(zoomViewManager.image).toBe(image);
  });

});
