import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, Renderer2} from "@angular/core";

import {ucZoomComponent} from './uc-zoom.component';



@Component({
  template: `
<img id="theImage" src="https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
     [style]="{'width': '500px'}" uc-zoom>
  `
})
class TestImageComponent {

}


describe('ucZoomComponent', () => {
  let component: ucZoomComponent;
  let fixture: ComponentFixture<ucZoomComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      declarations: [ ucZoomComponent ],
      providers: [Renderer2]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ucZoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('.ngAfterViewInit should wrap image, attach listeners, initialize lens and result, and become initialized', () => {
    const img: HTMLImageElement = new Image(10, 10);
    spyOn<any>(component, 'getNativeElement').and.returnValue(img);

    spyOn(component, 'wrapImage');
    spyOn(component, 'attachListenersToImage');
    spyOn(component, 'initializeLensAndResult');

    component.ngAfterViewInit();

    expect(component.wrapImage).toHaveBeenCalledOnceWith(img);
    expect(component.attachListenersToImage).toHaveBeenCalledOnceWith(img);
    expect(component.initializeLensAndResult).toHaveBeenCalledOnceWith(img);
    expect(component['isInitialized']).toBeTruthy();
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

    component.wrapImage(img);

    expect(renderer.parentNode).toHaveBeenCalledWith(img);
    expect(renderer.createElement).toHaveBeenCalledOnceWith('div');

    expect(renderer.addClass).toHaveBeenCalledOnceWith(wrapperDiv, 'uc-img-container');
    expect(renderer.insertBefore).toHaveBeenCalledOnceWith(parent, wrapperDiv, img);
    expect(renderer.removeChild).toHaveBeenCalledOnceWith(parent, img, true);
    expect(renderer.appendChild).toHaveBeenCalledOnceWith(wrapperDiv, img);
  });

  it('.attachListenersToImage should attach the mousemove and mouseenter listeners to the given image', () => {
    const img: HTMLImageElement = new Image(10, 10);

    const renderer = fixture.debugElement.injector.get(Renderer2);

    spyOn(renderer, 'listen');

    component.attachListenersToImage(img);

    expect(renderer.listen).toHaveBeenCalledWith(img, 'mousemove',jasmine.any(Function));
    expect(renderer.listen).toHaveBeenCalledWith(img, 'mouseenter',jasmine.any(Function));
    expect(renderer.listen).toHaveBeenCalledWith(img, 'load',jasmine.any(Function));
    expect(renderer.listen).toHaveBeenCalledWith(img, 'error',jasmine.any(Function));
    expect(renderer.listen).toHaveBeenCalledTimes(4);
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
    expect(createdLens.id).toBe('uc-zoom-lens');
    expect(createdLens.classList.contains('uc-img-zoom-lens')).toBeTruthy();
    expect(renderer.parentNode).toHaveBeenCalledOnceWith(img);
    expect(renderer.insertBefore).toHaveBeenCalledOnceWith(parent, createdLens, img);

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
    expect(createdZoomResultDiv.id).toBe('uc-zoom-result');
    expect(createdZoomResultDiv.classList.contains('uc-img-zoom-result')).toBeTruthy();
    expect(createdZoomResultDiv.style.left).toBe('10px');
    expect(renderer.parentNode).toHaveBeenCalledOnceWith(img);
    expect(renderer.appendChild).toHaveBeenCalledOnceWith(parent, createdZoomResultDiv);
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

    spyOn<any>(ucZoomComponent, 'calculateLensPosition');

    component.onImgMouseMove(eventFake);

    expect(ucZoomComponent['calculateLensPosition']).not.toHaveBeenCalled();

  });

  it('.onImgMouseMove should use given image instead of event target when available', () => {
    const eventImgDummy: HTMLImageElement = new Image(10, 10);
    const otherImgDummy: HTMLImageElement = new Image(20, 20);

    const eventFake = new MouseEvent('mousemove', {relatedTarget: eventImgDummy});

    component['isImageLoaded'] = true;
    component['isInitialized'] = true;

    spyOn<any>(ucZoomComponent, 'calculateLensPosition').and.returnValue({x: 5, y: 5});

    const renderer = fixture.debugElement.injector.get(Renderer2);

    spyOn(renderer, 'setStyle');

    component.onImgMouseMove(eventFake, otherImgDummy);

    expect(ucZoomComponent['calculateLensPosition']).toHaveBeenCalledOnceWith(eventFake, otherImgDummy, jasmine.any(Object));
  });

  it('.onImgMouseMove should use image provided by event if no other image is provided', () => {
    const eventImgDummy: HTMLImageElement = new Image(10, 10);

    const eventFake: MouseEvent = {
      target: eventImgDummy,
      preventDefault: () => {}
    } as any;

    component['isImageLoaded'] = true;
    component['isInitialized'] = true;

    spyOn<any>(ucZoomComponent, 'calculateLensPosition').and.returnValue({x: 5, y: 5});

    const renderer = fixture.debugElement.injector.get(Renderer2);

    spyOn(renderer, 'setStyle');

    component.onImgMouseMove(eventFake);

    expect(ucZoomComponent['calculateLensPosition']).toHaveBeenCalledOnceWith(eventFake, eventImgDummy, jasmine.any(Object));
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

    spyOn<any>(ucZoomComponent, 'calculateLensPosition').and.returnValue({x: 10, y: 20});

    component.onImgMouseMove(eventFake);

    expect(ucZoomComponent['calculateLensPosition']).toHaveBeenCalledOnceWith(eventFake, eventImgDummy, component['lens']);
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

    spyOn<any>(ucZoomComponent, 'calculateLensPosition').and.returnValue(dummyPosition);

    const renderer = fixture.debugElement.injector.get(Renderer2);

    spyOn(renderer, 'setStyle');

    spyOn(component.lensPosition, 'emit');

    component.onImgMouseMove(eventFake);

    expect(ucZoomComponent['calculateLensPosition']).toHaveBeenCalledOnceWith(eventFake, eventImgDummy, jasmine.any(Object));
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

  it('.calculateLensPosition should calculate a valid position', () => {
    const eventFake = new MouseEvent('mousemove');

    const imgFake: HTMLImageElement = new Image(1000, 800);

    const lensFake: Partial<HTMLDivElement> = {
      offsetWidth: 100,
      offsetHeight: 100
    };

    const positionFake = {x: 200, y: 200};

    spyOn<any>(ucZoomComponent, 'getCursorPosition').and.returnValue(positionFake);

    const result = (ucZoomComponent as any).calculateLensPosition(eventFake, imgFake, lensFake as HTMLDivElement);

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

    spyOn<any>(ucZoomComponent, 'getCursorPosition').and.returnValue(positionFake);

    const result = (ucZoomComponent as any).calculateLensPosition(eventFake, imgFake, lensFake as HTMLDivElement);

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

    spyOn<any>(ucZoomComponent, 'getCursorPosition').and.returnValue(positionFake);

    const result = (ucZoomComponent as any).calculateLensPosition(eventFake, imgFake, lensFake as HTMLDivElement);

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

    const result = (ucZoomComponent as any).getCursorPosition(eventFake, imgFake);

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

    const isLoaded = (ucZoomComponent as any).isImageAlreadyLoaded(imgFake);

    expect(isLoaded).toBeTrue();
  });


  it('.isImageAlreadyLoaded should return false if image is not completely loaded', () => {

    const imgFake: HTMLImageElement = {
      complete: false,
      naturalHeight: 0
    } as any;

    const isLoaded = (ucZoomComponent as any).isImageAlreadyLoaded(imgFake);

    expect(isLoaded).toBeFalse();
  });
});


describe('ucZoomComponent as a directive in an image html tag', () => {
  let component: TestImageComponent;
  let fixture: ComponentFixture<TestImageComponent>;

  let wrapperDiv: any;
  let image: HTMLImageElement;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      declarations: [ TestImageComponent, ucZoomComponent ],
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

  it('should properly wrap the image', () => {
    expect(wrapperDiv).toBeTruthy();
  });

  it('wrapper div should have as a first child the lens', () => {
    const lens = wrapperDiv && wrapperDiv.querySelector(':first-child');
    expect(lens).toBeTruthy();

    expect(lens.classList.contains('uc-img-zoom-lens')).toBeTrue();
    expect(lens.id).toBe('uc-zoom-lens');
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
    expect(zoomResult.id).toBe('uc-zoom-result');
  });

  it('the lens and the zoom result divs should be hidden at its creation', () => {
    const zoomResultDiv = wrapperDiv.querySelector('#uc-zoom-result');
    const lensDiv = wrapperDiv.querySelector('#uc-zoom-lens');

    expect(zoomResultDiv && zoomResultDiv.classList.contains('uc-hide-lens')).toBeTrue();
    expect(lensDiv && lensDiv.classList.contains('uc-hide-lens')).toBeTrue();
  });

  it('should detect mouseenter event and display the lens and zoom result accordingly', () => {

    const eventMouseEnter = new MouseEvent('mouseenter');

    image.dispatchEvent(eventMouseEnter);

    setTimeout(() => {
      fixture.detectChanges();
      const zoomResultDiv = fixture.nativeElement.querySelector('#uc-zoom-result');
      const lensDiv = fixture.nativeElement.querySelector('#uc-zoom-lens');

      expect(zoomResultDiv && !zoomResultDiv.classList.contains('uc-hide-lens')).toBeTrue();
      expect(lensDiv && !lensDiv.classList.contains('uc-hide-lens')).toBeTrue();
    }, 200);

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

      const zoomResultDiv = fixture.nativeElement.querySelector('#uc-zoom-result');
      const lensDiv = fixture.nativeElement.querySelector('#uc-zoom-lens');

      expect(lensDiv.style.left).toBeTruthy();
      expect(zoomResultDiv.style.backgroundPosition).toBeTruthy();
    }, 200);
  });

  it('should detect mouseleave event and hide the lens and zoom result accordingly', () => {

    const zoomResultDiv = wrapperDiv.querySelector('#uc-zoom-result');
    const lensDiv = wrapperDiv.querySelector('#uc-zoom-lens');

    zoomResultDiv.classList.remove('uc-hide-lens');
    lensDiv.classList.remove('uc-hide-lens');

    const eventMouseLeave = new MouseEvent('mouseleave');

    image.dispatchEvent(eventMouseLeave);

    setTimeout(() => {
      fixture.detectChanges();

      expect(zoomResultDiv && zoomResultDiv.classList.contains('uc-hide-lens')).toBeTrue();
      expect(lensDiv && lensDiv.classList.contains('uc-hide-lens')).toBeTrue();
    }, 200);
  });

});
