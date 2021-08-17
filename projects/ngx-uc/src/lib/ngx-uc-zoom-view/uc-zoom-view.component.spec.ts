import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ElementRef, Renderer2, ViewChild, ViewEncapsulation} from "@angular/core";

import {UcZoomViewComponent} from './uc-zoom-view.component';
import {UC_ZOOM_VIEW_DEFAULT_CONFIG, UcZoomViewConfig, UcZoomViewPosition} from "./uc-zoom-view-config";


@Component({
  template: `
<img id="theImage" src="{{imgSrc}}"
     [style]="{'width': '500px'}" uc-zoom-view>
  `
})
class TestImageComponent {
  @ViewChild(UcZoomViewComponent)
  ucZoomViewComponent!: UcZoomViewComponent;

  imgSrc = 'https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260';
}

@Component({
  template: `
<img src="https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
     [style]="{'width': '500px'}" uc-zoom-view [uc-zoom-view-config]="customOptions">
  `,
  styles: [
    `
      .custom-zoom-lens {
        position: absolute;
        border: 1px dotted white;
        width: 50px;
        height: 50px;
      }
    `,
    `
      .custom-zoom-result {
        position: absolute;
        top: 0;
        margin-left: 10px;
        border: 2px dashed black;
        width: 400px;
        height: 400px;
      }
    `,
    `
      .custom-img-container {
        position: relative;
        display: inline-block;
        border: 1px solid black;
      }
    `
  ],
  encapsulation: ViewEncapsulation.None
})
class TestCustomizedOptionsImageComponent {
  customOptions:UcZoomViewConfig = {
    cssClasses: {
      imageContainer: 'custom-img-container',
      lens: 'custom-zoom-lens',
      zoomView: 'custom-zoom-result'
    }
  };
}

@Component({
  template: `
<img id="theImage2" src="https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
     [style]="{'width': '500px'}" uc-zoom-view [uc-z-view]="zoomView">
<div #zoomView class="custom-zoom-view"></div>
  `,
  styles: [`
    .custom-zoom-view {
      height: 500px;
      width: 500px;
    }
  `]
})
class TestImageExternalZoomViewComponent {
  @ViewChild(UcZoomViewComponent)
  ucZoomViewComponent!: UcZoomViewComponent;
}

@Component({
  template: `
<img id="theImage2" src="https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
     [style]="{'width': '500px'}" uc-zoom-view [uc-z-view]="zoomView" [uc-zoom-view-config]="zoomViewConfig" >
<div #zoomView class="custom-zoom-view"></div>
  `,
  styles: [`
    .custom-zoom-view {
      height: 500px;
      width: 500px;
    }
  `]
})
class TestImageExternalZoomViewCustomizedComponent {
  zoomViewConfig: UcZoomViewConfig = {
    resetExtViewOnMouseLeave: false
  }

  @ViewChild(UcZoomViewComponent)
  ucZoomViewComponent!: UcZoomViewComponent;
}


describe('UcZoomViewComponent', () => {
  let component: UcZoomViewComponent;
  let fixture: ComponentFixture<UcZoomViewComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      declarations: [ UcZoomViewComponent ],
      providers: [Renderer2]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UcZoomViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('.mergeConfig should properly merge with no provided config', () => {
    const config = UC_ZOOM_VIEW_DEFAULT_CONFIG;

    const result = (UcZoomViewComponent as any).mergeConfig(config, undefined);

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

    const result = (UcZoomViewComponent as any).mergeConfig(config, {});

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

    const result = (UcZoomViewComponent as any).mergeConfig(config, {cssClasses: {hideLens: hideLens}});

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

    const result = (UcZoomViewComponent as any).mergeConfig(config, fullyProvidedConfig);

    expect(result).toBeTruthy();
    expect(result.cssClasses).toBeTruthy();
    expect(result.cssClasses.imageContainer).toBe(fullyProvidedConfig.cssClasses?.imageContainer);
    expect(result.cssClasses.lens).toBe(fullyProvidedConfig.cssClasses?.lens);
    expect(result.cssClasses.zoomView).toBe(fullyProvidedConfig.cssClasses?.zoomView);
    expect(result.cssClasses.hideLens).toBe(fullyProvidedConfig.cssClasses?.hideLens);
    expect(result.resetExtViewOnMouseLeave).toBeFalse();
    expect(result.viewPosition).toBe(UcZoomViewPosition.LEFT);
  });

  it('.ngAfterViewInit should wrap image, attach listeners, initialize lens and result, and become initialized', () => {
    const img: HTMLImageElement = new Image(10, 10);
    spyOn<any>(component, 'getNativeElement').and.returnValue(img);

    const wrapperDiv = document.createElement('div');
    spyOn(component, 'wrapImage').and.returnValue(wrapperDiv);
    spyOn(component, 'attachListenersToImage');
    spyOn(component, 'initializeLensAndResult');

    component.ngAfterViewInit();

    expect(component.wrapImage).toHaveBeenCalledOnceWith(img);
    expect(component.attachListenersToImage).toHaveBeenCalledOnceWith(img);
    expect(component.initializeLensAndResult).toHaveBeenCalledOnceWith(img);
    expect(component['isInitialized']).toBeTruthy();
    expect(component['outerDiv']).toBeDefined();
  });

  it('.wrapImage should wrap the given image in a div container', () => {
    const img: HTMLImageElement = new Image(10, 10);

    const renderer = fixture.debugElement.injector.get(Renderer2);
    const parent = document.body;
    spyOn(renderer, 'parentNode').and.returnValue(parent);

    const wrapperDiv = document.createElement('div');
    spyOn(renderer, 'createElement').and.returnValue(wrapperDiv);

    spyOn(renderer, 'addClass');
    spyOn(renderer, 'insertBefore');
    spyOn(renderer, 'removeChild');
    spyOn(renderer, 'appendChild');

    const returnedWrapperDiv = component.wrapImage(img);

    expect(renderer.parentNode).toHaveBeenCalledWith(img);
    expect(renderer.createElement).toHaveBeenCalledOnceWith('div');

    expect(renderer.addClass).toHaveBeenCalledOnceWith(wrapperDiv, 'uc-img-container');
    expect(renderer.insertBefore).toHaveBeenCalledOnceWith(parent, wrapperDiv, img);
    expect(renderer.removeChild).toHaveBeenCalledOnceWith(parent, img, true);
    expect(renderer.appendChild).toHaveBeenCalledOnceWith(wrapperDiv, img);
    expect(returnedWrapperDiv).toBe(wrapperDiv);
  });

  it('.unWrapImage should unwrap the image letting it in the state it was before wrapped', () => {
    const img: HTMLImageElement = new Image(10, 10);

    const renderer = fixture.debugElement.injector.get(Renderer2);

    spyOn(renderer, 'removeChild');

    const parent = document.body;
    spyOn(renderer, 'parentNode').and.returnValue(parent);

    spyOn(renderer, 'insertBefore');

    component['outerDiv'] = document.createElement('div');
    component['lens'] = document.createElement('div');
    component['zoomResult'] = document.createElement('div');

    component.unWrapImage(img);

    expect(renderer.removeChild).toHaveBeenCalledWith(component['outerDiv'], img);
    expect(renderer.removeChild).toHaveBeenCalledWith(component['outerDiv'], component['lens']);
    expect(renderer.removeChild).toHaveBeenCalledWith(component['outerDiv'], component['zoomResult']);
    expect(renderer.parentNode).toHaveBeenCalledWith(component['outerDiv']);
    expect(renderer.insertBefore).toHaveBeenCalledWith(parent, img, component['outerDiv'], true);
    expect(renderer.removeChild).toHaveBeenCalledWith(parent, component['outerDiv']);

  });

  it('.unWrapImage should not touch the external zoom view', () => {
    const img: HTMLImageElement = new Image(10, 10);

    const renderer = fixture.debugElement.injector.get(Renderer2);

    spyOn(renderer, 'removeChild');

    const parent = document.body;
    spyOn(renderer, 'parentNode').and.returnValue(parent);

    spyOn(renderer, 'insertBefore');

    component['outerDiv'] = document.createElement('div');
    component['outerDiv'].id = 'outerDiv';
    component['lens'] = document.createElement('div');
    component['zoomResult'] = document.createElement('div');
    component['zoomResult'].id = 'zoomResult';
    component.ucZoomResultView = {};

    component.unWrapImage(img);

    expect(renderer.removeChild).not.toHaveBeenCalledWith(component['outerDiv'], component['zoomResult']);

  });

  it('.ngOnDestroy should call the unwrap operation', () => {
    const img: HTMLImageElement = new Image(10, 10);

    spyOn(component, 'unWrapImage');
    spyOn(component['srcMutationObserver'], 'disconnect').and.callThrough();

    const elRef = new ElementRef(img);

    const originalElRef = component['elRef'];
    component['elRef'] = elRef;

    const originalUnListeners = component['unListeners'];

    component['unListeners'] = [];

    let isAllUnlistenersCalled = false;
    component['unListeners'].push(() => isAllUnlistenersCalled=true);
    component['unListeners'].push(() => {if(isAllUnlistenersCalled) isAllUnlistenersCalled=true});

    component.ngOnDestroy();

    expect(component.unWrapImage).toHaveBeenCalledWith(elRef.nativeElement);
    expect(isAllUnlistenersCalled).toBeTrue();
    expect(component['srcMutationObserver'].disconnect).toHaveBeenCalled();

    component['elRef'] = originalElRef;
    component['unListeners'] = originalUnListeners;

  });

  it('.attachListenersToImage should attach the listeners to the given image', () => {
    const img: HTMLImageElement = new Image(10, 10);

    const renderer = fixture.debugElement.injector.get(Renderer2);

    const originalUnListeners = component['unListeners'];

    component['unListeners'] = [];

    spyOn(renderer, 'listen').and.returnValue(() => {});
    spyOn(component['srcMutationObserver'], 'observe');

    component.attachListenersToImage(img);

    expect(renderer.listen).toHaveBeenCalledWith(img, 'mousemove',jasmine.any(Function));
    expect(renderer.listen).toHaveBeenCalledWith(img, 'mouseenter',jasmine.any(Function));
    expect(renderer.listen).toHaveBeenCalledWith(img, 'load',jasmine.any(Function));
    expect(renderer.listen).toHaveBeenCalledWith(img, 'error',jasmine.any(Function));
    expect(renderer.listen).toHaveBeenCalledTimes(4);
    expect(component['unListeners'].length).toBe(4);
    expect(component['srcMutationObserver'].observe).toHaveBeenCalled();

    component['unListeners'] = originalUnListeners;
  });

  it('.creatLens should create the lens div and attach before the given image', () => {
    const img: HTMLImageElement = new Image(10, 10);

    const renderer = fixture.debugElement.injector.get(Renderer2);

    const lensDiv = document.createElement('div');
    spyOn(renderer, 'createElement').and.returnValue(lensDiv);

    spyOn(renderer, 'setProperty').and.callThrough();
    spyOn(renderer, 'addClass').and.callThrough();
    spyOn(renderer, 'insertBefore');

    const parent = document.body;
    spyOn(renderer, 'parentNode').and.returnValue(parent);

    const createdLens = component.creatLens(img);

    expect(createdLens).toBe(lensDiv);
    expect(createdLens.classList.contains('uc-img-zoom-lens')).toBeTruthy();
    expect(renderer.parentNode).toHaveBeenCalledOnceWith(img);
    expect(renderer.insertBefore).toHaveBeenCalledOnceWith(parent, createdLens, img);
    expect(component['lens']).toBeDefined();

  });

  it('.createZoomResultContainer should create the zoomResult div and append it right after the given image', () => {
    const img: HTMLImageElement = new Image(10, 20);

    const renderer = fixture.debugElement.injector.get(Renderer2);

    const zoomResultDiv = document.createElement('div');
    spyOn(renderer, 'createElement').and.returnValue(zoomResultDiv);

    spyOn(renderer, 'setProperty').and.callThrough();
    spyOn(renderer, 'addClass').and.callThrough();
    spyOn(renderer, 'setStyle').and.callThrough();
    spyOn(renderer, 'appendChild');

    const parent = document.body;
    spyOn(renderer, 'parentNode').and.returnValue(parent);

    const createdZoomResultDiv = component.createZoomResultContainer(img);

    expect(createdZoomResultDiv).toBe(zoomResultDiv);
    expect(createdZoomResultDiv.classList.contains('uc-img-zoom-result')).toBeTruthy();
    expect(createdZoomResultDiv.style.left).toBe('10px');
    expect(renderer.parentNode).toHaveBeenCalledOnceWith(img);
    expect(renderer.appendChild).toHaveBeenCalledOnceWith(parent, createdZoomResultDiv);
    expect(component['zoomResult']).toBeDefined();

  });

  function prepareViewPositionTest(position: UcZoomViewPosition): { img: HTMLImageElement, zoomResultDiv: HTMLDivElement }{
    const img: HTMLImageElement = new Image(10, 20);

    const renderer = fixture.debugElement.injector.get(Renderer2);

    const zoomResultDiv = document.createElement('div');
    spyOn(renderer, 'createElement').and.returnValue(zoomResultDiv);

    const parent = document.body;
    spyOn(renderer, 'parentNode').and.returnValue(parent);

    component['config'].viewPosition = position;

    return {img: img, zoomResultDiv: zoomResultDiv};
  }

  function createZoomResultStyle(): void {
    let style = document.createElement('style');
    style.innerHTML = `
    .uc-img-zoom-result {
      position: absolute;
      top: 0;
      margin-left: 10px;
      border: 1px solid #d4d4d4;
      /*set the size of the result div:*/
      width: 700px;
      height: 700px;
    }
    `;

    document.getElementsByTagName('head')[0].appendChild(style);
  }

  it('.createZoomResultContainer should create properly create a zoom result div positioned bottom', () => {
    const {img, zoomResultDiv} = prepareViewPositionTest(UcZoomViewPosition.BOTTOM);

    const createdZoomResultDiv = component.createZoomResultContainer(img);
    expect(createdZoomResultDiv).toBe(zoomResultDiv);
    const calculatedPositionValue = img.height + component['config'].viewDistance;
    expect(createdZoomResultDiv.style.top).toBe(`${calculatedPositionValue}px`);
  });

  it('.createZoomResultContainer should create properly create a zoom result div positioned top', () => {
    const {img, zoomResultDiv} = prepareViewPositionTest(UcZoomViewPosition.TOP);

    createZoomResultStyle();

    const createdZoomResultDiv = component.createZoomResultContainer(img);
    expect(createdZoomResultDiv).toBe(zoomResultDiv);
    const calculatedPositionValue = -(700 + component['config'].viewDistance);
    expect(createdZoomResultDiv.style.top).toBe(`${calculatedPositionValue}px`);
  });

  it('.createZoomResultContainer should create properly create a zoom result div positioned left', () => {
    const {img, zoomResultDiv} = prepareViewPositionTest(UcZoomViewPosition.LEFT);

    createZoomResultStyle();

    const createdZoomResultDiv = component.createZoomResultContainer(img);
    expect(createdZoomResultDiv).toBe(zoomResultDiv);
    const calculatedPositionValue = -(700 + component['config'].viewDistance);
    expect(createdZoomResultDiv.style.left).toBe(`${calculatedPositionValue}px`);
  });

  it('.createZoomResultContainer should create properly create a zoom result div with a correctly calculated right position', () => {
    const {img, zoomResultDiv} = prepareViewPositionTest(UcZoomViewPosition.RIGHT);

    component['config'].viewDistance = 10;

    const createdZoomResultDiv = component.createZoomResultContainer(img);
    expect(createdZoomResultDiv).toBe(zoomResultDiv);
    const calculatedPositionValue = img.width + component['config'].viewDistance;
    expect(createdZoomResultDiv.style.left).toBe(`${calculatedPositionValue}px`);
  });

  it('.createZoomResultContainer should create properly create a zoom result div with a correctly calculated bottom position', () => {
    const {img, zoomResultDiv} = prepareViewPositionTest(UcZoomViewPosition.BOTTOM);

    component['config'].viewDistance = 10;

    const createdZoomResultDiv = component.createZoomResultContainer(img);
    expect(createdZoomResultDiv).toBe(zoomResultDiv);
    const calculatedPositionValue = img.height + component['config'].viewDistance;
    expect(createdZoomResultDiv.style.top).toBe(`${calculatedPositionValue}px`);
  });

  it('.initializeLensAndResult should initialize lens and zoom result', () => {
    const img: HTMLImageElement = new Image(10, 10);

    const zoomResultDiv = document.createElement('div');
    const lensDiv = document.createElement('div');

    spyOn(component, 'createZoomResultContainer').and.returnValue(zoomResultDiv);
    spyOn(component, 'creatLens').and.returnValue(lensDiv);

    spyOn<any>(component, 'calculateRatioBetweenResultAndLens');
    spyOn<any>(component, 'initializeZoomDiv');
    spyOn<any>(component, 'initializeLens');

    component.initializeLensAndResult(img);

    expect(component['zoomResult']).toBe(zoomResultDiv);
    expect(component['lens']).toBe(lensDiv);
    expect(component['calculateRatioBetweenResultAndLens']).toHaveBeenCalled();
    expect(component['initializeZoomDiv']).toHaveBeenCalledOnceWith(img);
    expect(component['initializeLens']).toHaveBeenCalledOnceWith(img);
  });

  it('.initializeLensAndResult should properly initialize a custom zoom result', () => {
    const img: HTMLImageElement = new Image(10, 10);

    const zoomResultDiv = document.createElement('div');
    const customZoomResultDiv = document.createElement('div');
    const lensDiv = document.createElement('div');

    component.ucZoomResultView = customZoomResultDiv;
    spyOn(component, 'setExternalZoomResultContainer').and.callThrough();
    spyOn(component, 'createZoomResultContainer').and.returnValue(zoomResultDiv);
    spyOn(component, 'creatLens').and.returnValue(lensDiv);

    spyOn<any>(component, 'calculateRatioBetweenResultAndLens');
    spyOn<any>(component, 'initializeZoomDiv');
    spyOn<any>(component, 'initializeLens');

    component.initializeLensAndResult(img);

    expect(component['zoomResult']).toBe(customZoomResultDiv);
    expect(component.setExternalZoomResultContainer).toHaveBeenCalled();
    expect(component['createZoomResultContainer']).not.toHaveBeenCalled();
    expect(component['initializeZoomDiv']).not.toHaveBeenCalledOnceWith(img);
  });

  it('.initializeLensAndResult should properly initialize a custom zoom result with resetExtViewOnMouseLeave off', () => {
    const img: HTMLImageElement = new Image(10, 10);

    const zoomResultDiv = document.createElement('div');
    const customZoomResultDiv = document.createElement('div');
    const lensDiv = document.createElement('div');

    component.ucZoomResultView = customZoomResultDiv;
    spyOn(component, 'setExternalZoomResultContainer').and.callThrough();
    spyOn(component, 'createZoomResultContainer').and.returnValue(zoomResultDiv);
    spyOn(component, 'creatLens').and.returnValue(lensDiv);

    spyOn<any>(component, 'calculateRatioBetweenResultAndLens');
    spyOn<any>(component, 'initializeZoomDiv');
    spyOn<any>(component, 'initializeLens');

    component['config'].resetExtViewOnMouseLeave = false;

    component.initializeLensAndResult(img);

    expect(component['zoomResult']).toBe(customZoomResultDiv);
    expect(component.setExternalZoomResultContainer).toHaveBeenCalled();
    expect(component['createZoomResultContainer']).not.toHaveBeenCalled();
    expect(component['initializeZoomDiv']).toHaveBeenCalled();
  });

  it('.initializeLens should hide and attach mousemove and mouseenter listeners', () => {
    const img: HTMLImageElement = new Image(10, 10);

    component['lens'] = document.createElement('div');

    const renderer = fixture.debugElement.injector.get(Renderer2);

    spyOn(renderer, 'listen');

    (component as any).initializeLens(img);

    expect(component['lens'].classList.contains('uc-hide-lens')).toBeTruthy();
    expect(renderer.listen).toHaveBeenCalledWith(component['lens'], 'mousemove', jasmine.any(Function));
    expect(renderer.listen).toHaveBeenCalledWith(component['lens'], 'mouseleave', jasmine.any(Function));
    expect(renderer.listen).toHaveBeenCalledTimes(2);
  });

  it('.initializeZoomDiv should initialize zoom div by setting the given image as the background, initializing its size and by hiding it', () => {
    const fakeSrc = 'anyimage.jpeg';
    const fakeWidth = 10;
    const fakeHeight = 20;

    const imgStub: Partial<HTMLImageElement> = {
      src: fakeSrc,
      width: fakeWidth,
      height: fakeHeight
    };

    spyOn<any>(component, 'initializeZoomDivBackgroundSize');
    component['isImageLoaded'] = true;
    component['zoomResult'] = document.createElement('div');

    (component as any).initializeZoomDiv(imgStub as HTMLImageElement);

    expect(component['zoomResult'].style.backgroundImage).toBe(`url("${fakeSrc}")`);
    expect(component['initializeZoomDivBackgroundSize']).toHaveBeenCalledOnceWith(imgStub as HTMLImageElement);
    expect(component['zoomResult'].classList.contains('uc-hide-lens'));
  });

  it('.initializeZoomDiv should not add class on zoomResult if external view is set', () => {

    const imgStub: Partial<HTMLImageElement> = {
      src: 'anyimage.jpeg',
      width: 10,
      height: 10
    };

    const renderer = fixture.debugElement.injector.get(Renderer2);

    spyOn(renderer, 'setStyle');
    spyOn(renderer, 'addClass');

    component.ucZoomResultView = {};

    (component as any).initializeZoomDiv(imgStub as HTMLImageElement);

    expect(renderer.addClass).not.toHaveBeenCalled();
  });

  it('.initializeZoomDiv should not initialize zoom background if image is not yet loaded', () => {
    const fakeSrc = 'anyimage.jpeg';
    const fakeWidth = 10;
    const fakeHeight = 20;

    const imgStub: Partial<HTMLImageElement> = {
      src: fakeSrc,
      width: fakeWidth,
      height: fakeHeight
    };

    spyOn<any>(component, 'initializeZoomDivBackgroundSize');
    component['isImageLoaded'] = false;
    component['zoomResult'] = document.createElement('div');

    (component as any).initializeZoomDiv(imgStub as HTMLImageElement);

    expect(component['initializeZoomDivBackgroundSize']).not.toHaveBeenCalled();
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

    component['cx'] = 3;
    component['cy'] = 2;
    component['zoomResult'] = document.createElement('div');

    (component as any).initializeZoomDivBackgroundSize(imgStub as HTMLImageElement);

    expect(component['zoomResult'].style.backgroundSize).toBe('30px 40px');
  });

  it('.onImageLoaded should initialize the background image size of the zoom div and set the isImageLoaded flag', ()=> {
    const fakeSrc = 'anyimage.jpeg';
    const fakeWidth = 10;
    const fakeHeight = 20;

    const imgStub: Partial<HTMLImageElement> = {
      src: fakeSrc,
      width: fakeWidth,
      height: fakeHeight
    };

    spyOn<any>(component, 'initializeZoomDivBackgroundSize');

    component.onImageLoaded(imgStub as HTMLImageElement);

    expect(component['initializeZoomDivBackgroundSize']).toHaveBeenCalledOnceWith(imgStub as HTMLImageElement);
    expect(component['isImageLoaded']).toBeTrue();

  });

  it('.calculateRatioBetweenResultAndLens should calculate the ratio between result and lens', () => {
    const zoomResultDivStub: Partial<HTMLDivElement> = {
      offsetWidth: 20,
      offsetHeight: 60
    };
    component['zoomResult'] = zoomResultDivStub as HTMLDivElement;

    const lensDivStub: Partial<HTMLDivElement> = {
      offsetWidth: 2,
      offsetHeight: 3
    };
    component['lens'] = lensDivStub as HTMLDivElement;

    (component as any).calculateRatioBetweenResultAndLens();

    expect(component['cx']).toBe(10);
    expect(component['cy']).toBe(20);

  });

  it('.onImgMouseMove should do nothing if not ready', () => {
    const eventFake = new MouseEvent('mousemove');

    component['isImageLoaded'] = false;

    spyOn<any>(UcZoomViewComponent, 'calculateLensPosition');

    component.onImgMouseMove(eventFake);

    expect(UcZoomViewComponent['calculateLensPosition']).not.toHaveBeenCalled();

  });

  it('.onImgMouseMove should use given image instead of event target when available', () => {
    const eventImgDummy: HTMLImageElement = new Image(10, 10);
    const otherImgDummy: HTMLImageElement = new Image(20, 20);

    const eventFake = new MouseEvent('mousemove', {relatedTarget: eventImgDummy});

    component['isImageLoaded'] = true;
    component['isInitialized'] = true;

    spyOn<any>(UcZoomViewComponent, 'calculateLensPosition').and.returnValue({x: 5, y: 5});

    const renderer = fixture.debugElement.injector.get(Renderer2);

    spyOn(renderer, 'setStyle');

    component.onImgMouseMove(eventFake, otherImgDummy);

    expect(UcZoomViewComponent['calculateLensPosition']).toHaveBeenCalledOnceWith(eventFake, otherImgDummy, jasmine.any(Object));
  });

  it('.onImgMouseMove should use image provided by event if no other image is provided', () => {
    const eventImgDummy: HTMLImageElement = new Image(10, 10);

    const eventFake: MouseEvent = {
      target: eventImgDummy,
      preventDefault: () => {}
    } as any;

    component['isImageLoaded'] = true;
    component['isInitialized'] = true;

    spyOn<any>(UcZoomViewComponent, 'calculateLensPosition').and.returnValue({x: 5, y: 5});

    const renderer = fixture.debugElement.injector.get(Renderer2);

    spyOn(renderer, 'setStyle');

    component.onImgMouseMove(eventFake);

    expect(UcZoomViewComponent['calculateLensPosition']).toHaveBeenCalledOnceWith(eventFake, eventImgDummy, jasmine.any(Object));
  });

  it('.onImgMouseMove should sets the position of the lens and the zoom background position according to the given mouse event', () => {
    const eventImgDummy: HTMLImageElement = new Image(10, 10);

    let preventDefaultCalled = false;
    const eventFake: MouseEvent = {
      target: eventImgDummy,
      preventDefault: () => {preventDefaultCalled = true}
    } as any;

    component['isImageLoaded'] = true;
    component['isInitialized'] = true;

    component['cx'] = 2;
    component['cy'] = 3;

    component['lens'] = document.createElement('div');
    component['zoomResult'] = document.createElement('div');

    spyOn<any>(UcZoomViewComponent, 'calculateLensPosition').and.returnValue({x: 10, y: 20});

    component.onImgMouseMove(eventFake);

    expect(UcZoomViewComponent['calculateLensPosition']).toHaveBeenCalledOnceWith(eventFake, eventImgDummy, component['lens']);
    expect(component['lens'].style.left).toBe('10px');
    expect(component['lens'].style.top).toBe('20px');
    expect(component['zoomResult'].style.backgroundPosition).toBe('-20px -60px');

  });

  it('.onImgMouseMove should emmit lens position', () => {
    const eventImgDummy: HTMLImageElement = new Image(10, 10);

    const eventFake: MouseEvent = {
      target: eventImgDummy,
      preventDefault: () => {}
    } as any;

    component['isImageLoaded'] = true;
    component['isInitialized'] = true;

    const dummyPosition = {x: 5, y: 6};

    spyOn<any>(UcZoomViewComponent, 'calculateLensPosition').and.returnValue(dummyPosition);

    const renderer = fixture.debugElement.injector.get(Renderer2);

    spyOn(renderer, 'setStyle');

    spyOn(component.lensPosition, 'emit');

    component.onImgMouseMove(eventFake);

    expect(UcZoomViewComponent['calculateLensPosition']).toHaveBeenCalledOnceWith(eventFake, eventImgDummy, jasmine.any(Object));
    expect(component.lensPosition.emit).toHaveBeenCalledOnceWith(dummyPosition);
  });

  it('.onImgMouseEnter should do nothing if not initialized', () => {
    const eventFake = new MouseEvent('mousemove');

    component['isImageLoaded'] = false;

    const renderer = fixture.debugElement.injector.get(Renderer2);

    spyOn(renderer, 'removeClass');

    component.onImgMouseEnter(eventFake);

    expect(renderer.removeClass).not.toHaveBeenCalled();
  });

  it('.onImgMouseEnter should display lens and zoom result', () => {
    const eventFake = new MouseEvent('mousemove');

    component['isImageLoaded'] = true;
    component['isInitialized'] = true;

    component['lens'] = document.createElement('div');
    component['zoomResult'] = document.createElement('div');

    const renderer = fixture.debugElement.injector.get(Renderer2);

    spyOn(renderer, 'removeClass');

    component.onImgMouseEnter(eventFake);

    expect(renderer.removeClass).toHaveBeenCalledWith(component['lens'], 'uc-hide-lens');
    expect(renderer.removeClass).toHaveBeenCalledWith(component['zoomResult'], 'uc-hide-lens');
  });

  it('.onImgMouseEnter should not try to display the external zoom view', () => {
    const eventFake = new MouseEvent('mousemove');

    component['isImageLoaded'] = true;
    component['isInitialized'] = true;

    component['zoomResult'] = document.createElement('div');
    component.ucZoomResultView = {};

    const renderer = fixture.debugElement.injector.get(Renderer2);

    spyOn(renderer, 'removeClass');

    component.onImgMouseEnter(eventFake);

    expect(renderer.removeClass).not.toHaveBeenCalledWith(component['zoomResult'], jasmine.any(Object));
  });

  it('.onImgMouseEnter should prepare the external zoom view if resetExtViewOnMouseLeave is turned on', () => {
    const eventFake = new MouseEvent('mousemove');

    component['isImageLoaded'] = true;
    component['isInitialized'] = true;

    component['zoomResult'] = document.createElement('div');
    component.ucZoomResultView = {};

    const renderer = fixture.debugElement.injector.get(Renderer2);

    const imgDummy: HTMLImageElement = new Image(10, 10);

    spyOn(renderer, 'addClass');
    spyOn<any>(component, 'getNativeElement').and.returnValue(imgDummy);
    spyOn<any>(component, 'initializeZoomDiv');

    component.onImgMouseEnter(eventFake);

    expect(component['initializeZoomDiv']).toHaveBeenCalledOnceWith(imgDummy);
  });

  it('.onImgMouseEnter should not prepare the external zoom view if resetExtViewOnMouseLeave is turned off', () => {
    const eventFake = new MouseEvent('mousemove');

    component['isImageLoaded'] = true;
    component['isInitialized'] = true;

    component['zoomResult'] = document.createElement('div');
    component.ucZoomResultView = {};

    const renderer = fixture.debugElement.injector.get(Renderer2);

    spyOn(renderer, 'addClass');
    spyOn<any>(component, 'initializeZoomDiv');

    component['config'].resetExtViewOnMouseLeave = false;

    component.onImgMouseEnter(eventFake);

    expect(component['initializeZoomDiv']).not.toHaveBeenCalled();
  });

  it('.onImgMouseLeave should do nothing if not ready', () => {
    const eventFake = new MouseEvent('mousemove');

    component['isImageLoaded'] = false;

    const renderer = fixture.debugElement.injector.get(Renderer2);

    spyOn(renderer, 'addClass');

    component.onImgMouseLeave(eventFake);

    expect(renderer.addClass).not.toHaveBeenCalled();
  });

  it('.onImgMouseLeave should hide lens and zoom result', () => {
    const eventFake = new MouseEvent('mousemove');

    component['isImageLoaded'] = true;
    component['isInitialized'] = true;

    component['lens'] = document.createElement('div');
    component['zoomResult'] = document.createElement('div');

    const renderer = fixture.debugElement.injector.get(Renderer2);

    spyOn(renderer, 'addClass');

    component.onImgMouseLeave(eventFake);

    expect(renderer.addClass).toHaveBeenCalledWith(component['lens'], 'uc-hide-lens');
    expect(renderer.addClass).toHaveBeenCalledWith(component['zoomResult'], 'uc-hide-lens');
  });

  it('.onImgMouseLeave should not try to hide the external zoom view', () => {
    const eventFake = new MouseEvent('mousemove');

    component['isImageLoaded'] = true;
    component['isInitialized'] = true;

    component['zoomResult'] = document.createElement('div');
    component.ucZoomResultView = {};

    const renderer = fixture.debugElement.injector.get(Renderer2);

    spyOn(renderer, 'addClass');

    component.onImgMouseLeave(eventFake);

    expect(renderer.addClass).not.toHaveBeenCalledWith(component['zoomResult'], jasmine.any(Object));
  });

  it('.onImgMouseLeave should reset the external zoom view if resetExtViewOnMouseLeave is turned on', () => {
    const eventFake = new MouseEvent('mousemove');

    component['isImageLoaded'] = true;
    component['isInitialized'] = true;

    component['zoomResult'] = document.createElement('div');
    component.ucZoomResultView = {};

    const renderer = fixture.debugElement.injector.get(Renderer2);

    spyOn(renderer, 'addClass');

    component.onImgMouseLeave(eventFake);

    expect(component['zoomResult'].style.backgroundImage).toBeFalsy();
    expect(component['zoomResult'].style.backgroundSize).toBeFalsy();
    expect(component['zoomResult'].style.backgroundPosition).toBeFalsy();
  });

  it('.onImgMouseLeave should not reset the external zoom view if resetExtViewOnMouseLeave is turned off', () => {
    const eventFake = new MouseEvent('mousemove');

    component['isImageLoaded'] = true;
    component['isInitialized'] = true;

    component['zoomResult'] = document.createElement('div');
    component.ucZoomResultView = {};

    const renderer = fixture.debugElement.injector.get(Renderer2);

    spyOn(renderer, 'addClass');
    spyOn<any>(component, 'resetZoomView');

    component['config'].resetExtViewOnMouseLeave = false;

    component.onImgMouseLeave(eventFake);

    expect(component['resetZoomView']).not.toHaveBeenCalled();
  });

  it('.calculateLensPosition should calculate a valid position', () => {
    const eventFake = new MouseEvent('mousemove');

    const imgFake: HTMLImageElement = new Image(1000, 800);

    const lensFake: Partial<HTMLDivElement> = {
      offsetWidth: 100,
      offsetHeight: 100
    };

    const positionFake = {x: 200, y: 200};

    spyOn<any>(UcZoomViewComponent, 'getCursorPosition').and.returnValue(positionFake);

    const result = (UcZoomViewComponent as any).calculateLensPosition(eventFake, imgFake, lensFake as HTMLDivElement);

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

    spyOn<any>(UcZoomViewComponent, 'getCursorPosition').and.returnValue(positionFake);

    const result = (UcZoomViewComponent as any).calculateLensPosition(eventFake, imgFake, lensFake as HTMLDivElement);

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

    spyOn<any>(UcZoomViewComponent, 'getCursorPosition').and.returnValue(positionFake);

    const result = (UcZoomViewComponent as any).calculateLensPosition(eventFake, imgFake, lensFake as HTMLDivElement);

    expect(result).toEqual({x: 0 , y: 0});
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

    const result = (UcZoomViewComponent as any).getCursorPosition(eventFake, imgFake);

    expect(result).toEqual({x: 50 , y: 60});
  });

  it('.isReady should evaluate to true if the image is loaded and the component initialized', () => {

    component['isImageLoaded'] = true;
    component['isInitialized'] = true;

    const isReady = (component as any).isReady;

    expect(isReady).toBeTrue();

  });

  it('.isReady should evaluate to false if the image is not loaded', () => {

    component['isImageLoaded'] = false;
    component['isInitialized'] = true;

    const isReady = (component as any).isReady;

    expect(isReady).toBeFalse();

  });

  it('.isReady should evaluate to false if the component is not initialized', () => {

    component['isImageLoaded'] = true;
    component['isInitialized'] = false;

    const isReady = (component as any).isReady;

    expect(isReady).toBeFalse();

  });


  it('.isImageAlreadyLoaded should return true if image is completely loaded', () => {

    const imgFake: HTMLImageElement = {
      complete: true,
      naturalHeight: 1000
    } as any;

    const isLoaded = (UcZoomViewComponent as any).isImageAlreadyLoaded(imgFake);

    expect(isLoaded).toBeTrue();
  });


  it('.isImageAlreadyLoaded should return false if image is not completely loaded', () => {

    const imgFake: HTMLImageElement = {
      complete: false,
      naturalHeight: 0
    } as any;

    const isLoaded = (UcZoomViewComponent as any).isImageAlreadyLoaded(imgFake);

    expect(isLoaded).toBeFalse();
  });

  it('.onImageSourceChange should update the zoom view image', () => {
    spyOn<any>(component, 'getNativeElement').and.callThrough();
    spyOn<any>(component, 'setZoomViewResultImage');
    spyOn<any>(component, 'initializeZoomDivBackgroundSize');

    (component as any).onImageSourceChange();

    expect(component['getNativeElement']).toHaveBeenCalled();
    expect(component['setZoomViewResultImage']).toHaveBeenCalled();
    expect(component['initializeZoomDivBackgroundSize']).toHaveBeenCalled();
  });
});


describe('UcZoomViewComponent as a directive in an image html tag', () => {
  let component: TestImageComponent;
  let fixture: ComponentFixture<TestImageComponent>;

  let wrapperDiv: any;
  let image: HTMLImageElement;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      declarations: [ TestImageComponent, UcZoomViewComponent ],
      providers: [Renderer2]
    }).compileComponents();

  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    wrapperDiv = fixture.nativeElement.querySelector('div.uc-img-container');
    image = fixture.nativeElement.querySelector('#theImage');
  });

  it('should be default configured', () => {
    const ucZoomViewComponent  = component.ucZoomViewComponent;
    const config = ucZoomViewComponent['config'];

    expect(config.cssClasses).toBeTruthy();
    expect(config.cssClasses.imageContainer).toBe(UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.imageContainer);
    expect(config.cssClasses.lens).toBe(UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.lens);
    expect(config.cssClasses.zoomView).toBe(UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.zoomView);
    expect(config.cssClasses.hideLens).toBe(UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens);
  });

  it('should properly wrap the image', () => {
    expect(wrapperDiv).toBeTruthy();
  });

  it('wrapper div should have as a first child the lens', () => {
    const lens = wrapperDiv && wrapperDiv.querySelector(':first-child');
    expect(lens).toBeTruthy();

    expect(lens.classList.contains('uc-img-zoom-lens')).toBeTrue();
  });

  it('wrapper div should have the original image tag as a child', () => {
    const originalImage =  wrapperDiv.querySelector('img');
    expect(originalImage).toBeTruthy();

    expect(originalImage.id).toBe('theImage');
  });

  it('wrapper div should have, as a child, the zoom result div right before the image tag', () => {
    const zoomResult = wrapperDiv && wrapperDiv.querySelector('#theImage + *');
    expect(zoomResult).toBeTruthy();

    expect(zoomResult.classList.contains('uc-img-zoom-result')).toBeTrue();
  });

  it('should have default css classes set', () => {
    expect(wrapperDiv.classList.contains(UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.imageContainer)).toBeTruthy();
    expect(wrapperDiv.querySelector(`div.${UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.lens}`)).toBeTruthy();
    expect(wrapperDiv.querySelector(`div.${UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.zoomView}`)).toBeTruthy();
  });

  it('the lens and the zoom result divs should be hidden at its creation', () => {
    const zoomResultDiv = wrapperDiv.querySelector('div.uc-img-zoom-result');
    const lensDiv = wrapperDiv.querySelector('div.uc-img-zoom-lens');

    expect(zoomResultDiv && zoomResultDiv.classList.contains(UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens)).toBeTrue();
    expect(lensDiv && lensDiv.classList.contains(UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens)).toBeTrue();
  });

  it('should detect mouseenter event and display the lens and zoom result accordingly', () => {

    const eventMouseEnter = new MouseEvent('mouseenter');

    image.dispatchEvent(eventMouseEnter);

    setTimeout(() => {
      fixture.detectChanges();
      const zoomResultDiv = wrapperDiv.querySelector('div.uc-img-zoom-result');
      const lensDiv = wrapperDiv.querySelector('div.uc-img-zoom-lens');

      expect(zoomResultDiv && !zoomResultDiv.classList.contains(UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens)).toBeTrue();
      expect(lensDiv && !lensDiv.classList.contains(UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens)).toBeTrue();
    }, 400);

  });

  it('should detect mouseover event and update the lens position and the zoom visualization position', () => {

    const imageRect = image.getBoundingClientRect();

    const eventMouseOver = new MouseEvent('mouseover', {
      clientX: imageRect.left + 20,
      clientY: imageRect.top - 20
    });

    image.dispatchEvent(eventMouseOver);

    setTimeout(() => {
      fixture.detectChanges();

      const zoomResultDiv = wrapperDiv.querySelector('div.uc-img-zoom-result');
      const lensDiv = wrapperDiv.querySelector('div.uc-img-zoom-lens');

      expect(lensDiv.style.left).toBeTruthy();
      expect(zoomResultDiv.style.backgroundPosition).toBeTruthy();
    }, 400);
  });

  it('should detect mouseleave event and hide the lens and zoom result accordingly', () => {

    const zoomResultDiv = wrapperDiv.querySelector('div.uc-img-zoom-result');
    const lensDiv = wrapperDiv.querySelector('div.uc-img-zoom-lens');

    zoomResultDiv.classList.remove(UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens);
    lensDiv.classList.remove(UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens);

    const eventMouseLeave = new MouseEvent('mouseleave');

    image.dispatchEvent(eventMouseLeave);

    setTimeout(() => {
      fixture.detectChanges();

      expect(zoomResultDiv && zoomResultDiv.classList.contains(UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens)).toBeTrue();
      expect(lensDiv && lensDiv.classList.contains(UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens)).toBeTrue();
    }, 400);
  });

  it('should change the zoom view image if the source of the image changes', () => {
    const newImage = 'https://images.pexels.com/photos/8704649/pexels-photo-8704649.jpeg?cs=srgb&dl=pexels-daria-ponomareva-8704649.jpg&fm=jpg';

    component.imgSrc = newImage;
    fixture.detectChanges();

    setTimeout(() => {

      const thisWrapperDiv = fixture.nativeElement.querySelector('div.uc-img-container');
      const zoomResultDiv = thisWrapperDiv.querySelector('div.uc-img-zoom-result');
      const resultImage = zoomResultDiv.style.backgroundImage;

      expect(resultImage).toContain(newImage);

    }, 400);
  });

});


describe('UcZoomViewComponent with custom options', () => {
  let component: TestCustomizedOptionsImageComponent;
  let fixture: ComponentFixture<TestCustomizedOptionsImageComponent>;

  let wrapperDiv: any;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      declarations: [ TestCustomizedOptionsImageComponent, UcZoomViewComponent ],
      providers: [Renderer2]
    }).compileComponents();

  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestCustomizedOptionsImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    wrapperDiv = fixture.nativeElement.querySelector('div');
  });

  it('should have customize classes set', () => {
    expect(wrapperDiv.classList.contains('custom-img-container')).toBeTrue();
    expect(wrapperDiv.querySelector('div.custom-zoom-lens')).toBeTruthy();
    expect(wrapperDiv.querySelector('div.custom-zoom-result')).toBeTruthy();
  });
});

describe('UcZoomViewComponent with custom view', () => {
  let component: TestImageExternalZoomViewComponent;
  let fixture: ComponentFixture<TestImageExternalZoomViewComponent>;

  let wrapperDiv: any;
  let externalZoomView: any;
  let image: HTMLImageElement;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      declarations: [ TestImageExternalZoomViewComponent, UcZoomViewComponent ],
      providers: [Renderer2]
    }).compileComponents();

  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestImageExternalZoomViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    wrapperDiv = fixture.nativeElement.querySelector('div.uc-img-container');
    externalZoomView = fixture.nativeElement.querySelector('div.custom-zoom-view');
    image = fixture.nativeElement.querySelector('#theImage2');
  });

  it('should use the custom view and not create the default one', () => {
    expect(wrapperDiv).toBeTruthy();
    expect(wrapperDiv.querySelector('div.uc-img-zoom-lens')).toBeTruthy();
    expect(wrapperDiv.querySelector('div.uc-img-zoom-result')).toBeFalsy();
    expect(wrapperDiv.querySelector('div.custom-zoom-view')).toBeFalsy();
    expect(externalZoomView).toBeTruthy();
    expect(externalZoomView.style.backgroundImage).toBeFalsy();
    expect(externalZoomView.classList.contains(UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens)).toBeFalsy();
  });

  it('should detect mouseover event and update the lens position and the zoom visualization position', () => {

    const imageRect = image.getBoundingClientRect();

    const eventMouseOver = new MouseEvent('mouseover', {
      clientX: imageRect.left + 20,
      clientY: imageRect.top - 20
    });

    image.dispatchEvent(eventMouseOver);

    setTimeout(() => {
      fixture.detectChanges();

      const zoomResultDiv = wrapperDiv.querySelector('div.custom-zoom-view');
      const lensDiv = wrapperDiv.querySelector('div.uc-img-zoom-lens');

      expect(lensDiv.style.left).toBeTruthy();
      expect(zoomResultDiv.style.backgroundPosition).toBeTruthy();
    }, 400);
  });

  it('should detect mouseenter event and display the lens and update the external zoom result accordingly', () => {

    const eventMouseEnter = new MouseEvent('mouseenter');

    image.dispatchEvent(eventMouseEnter);

    setTimeout(() => {
      fixture.detectChanges();
      const zoomResultDiv = wrapperDiv.querySelector('div.custom-zoom-view');
      const lensDiv = wrapperDiv.querySelector('div.uc-img-zoom-lens');

      expect(lensDiv && !lensDiv.classList.contains(UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens)).toBeTrue();
      expect(zoomResultDiv.style.backgroundImage).toBeTruthy();
      expect(zoomResultDiv.style.backgroundSize).toBeTruthy();
    }, 400);

  });

  it('should detect mouseleave event and hide the lens and reset the external zoom result accordingly', () => {

    const zoomResultDiv = wrapperDiv.querySelector('div.custom-zoom-view');
    const lensDiv = wrapperDiv.querySelector('div.uc-img-zoom-lens');

    lensDiv.classList.remove(UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens);

    const eventMouseLeave = new MouseEvent('mouseleave');

    image.dispatchEvent(eventMouseLeave);

    setTimeout(() => {
      fixture.detectChanges();

      expect(lensDiv && lensDiv.classList.contains(UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens)).toBeTrue();
      expect(zoomResultDiv.style.backgroundImage).toBeFalsy();
      expect(zoomResultDiv.style.backgroundSize).toBeFalsy();
      expect(zoomResultDiv.style.backgroundPosition).toBeFalsy();
    }, 400);
  });

});

describe('UcZoomViewComponent with custom options and resetExtViewOnMouseLeave turned off', () => {
  let component: TestImageExternalZoomViewCustomizedComponent;
  let fixture: ComponentFixture<TestImageExternalZoomViewCustomizedComponent>;

  let wrapperDiv: any;
  let externalZoomView: any;
  let image: HTMLImageElement;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      declarations: [ TestImageExternalZoomViewCustomizedComponent, UcZoomViewComponent ],
      providers: [Renderer2]
    }).compileComponents();

  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestImageExternalZoomViewCustomizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    wrapperDiv = fixture.nativeElement.querySelector('div.uc-img-container');
    externalZoomView = fixture.nativeElement.querySelector('div.custom-zoom-view');
    image = fixture.nativeElement.querySelector('#theImage2');
  });

  it('should detect mouseleave event and hide the lens and not reset external zoom result', () => {

    const zoomResultDiv = wrapperDiv.querySelector('div.custom-zoom-view');
    const lensDiv = wrapperDiv.querySelector('div.uc-img-zoom-lens');

    lensDiv.classList.remove(UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens);

    const eventMouseLeave = new MouseEvent('mouseleave');

    image.dispatchEvent(eventMouseLeave);

    setTimeout(() => {
      fixture.detectChanges();

      expect(lensDiv && lensDiv.classList.contains(UC_ZOOM_VIEW_DEFAULT_CONFIG.cssClasses.hideLens)).toBeTrue();
      expect(zoomResultDiv.style.backgroundImage).toBeTruthy();
      expect(zoomResultDiv.style.backgroundSize).toBeTruthy();
      expect(zoomResultDiv.style.backgroundPosition).toBeTruthy();
    }, 400);
  });
});
