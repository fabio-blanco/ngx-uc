import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ElementRef, Renderer2, ViewChild, ViewEncapsulation} from "@angular/core";

import {UcZoomViewComponent} from './uc-zoom-view.component';
import {UC_ZOOM_VIEW_DEFAULT_CONFIG, UcZoomViewConfig} from "./uc-zoom-view-config";
import {UcZoomViewImageManager} from "./uc-zoom-view-image-manager";
import {UcZoomViewManager} from "./uc-zoom-view-manager";


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
     [style]="{'width': '500px'}" uc-zoom-view [uc-zoom-view-config]="customOptions" [(ucZoomOn)]="on">
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

  on = true;

  customOptions:UcZoomViewConfig = {
    cssClasses: {
      imageContainer: 'custom-img-container',
      lens: 'custom-zoom-lens',
      zoomView: 'custom-zoom-result'
    }
  };

  @ViewChild(UcZoomViewComponent)
  ucZoomViewComponent!: UcZoomViewComponent;
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
    const image = new Image(100,200);
    const elRef: ElementRef = new ElementRef(image);
    component['elRef'] = elRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('.ngOnInit should properly instantiate the manager', () => {
    expect(component['zoomViewManager']).toBeTruthy();
  });

  it('.ngAfterViewInit should initialize the manager', () => {
    const zoomViewManagerFake = {
      initializeViewer() {},
      destroy() {}
    } as UcZoomViewManager;

    spyOn(zoomViewManagerFake, 'initializeViewer');

    component['zoomViewManager'] = zoomViewManagerFake;

    component.ngAfterViewInit();

    expect(zoomViewManagerFake.initializeViewer).toHaveBeenCalled();
  });

  it('.ngOnDestroy should call the destroy on the manager', () => {
    const zoomViewManagerFake = {
      destroy() {}
    } as UcZoomViewManager;

    spyOn(zoomViewManagerFake, 'destroy');

    component['zoomViewManager'] = zoomViewManagerFake;

    component.ngOnDestroy();

    expect(zoomViewManagerFake.destroy).toHaveBeenCalled();
  });

  it('.isReady should evaluate to true if the manager is ready', () => {
    const zoomViewManagerFake = {
      destroy() {},
      get isReady() {
        return true;
      }
    } as UcZoomViewManager;

    component['zoomViewManager'] = zoomViewManagerFake;

    expect(component.isReady).toBeTrue();
  });

  it('.isReady should evaluate to false if the manager is not ready', () => {
    const zoomViewManagerFake = {
      destroy() {},
      get isReady() {
        return false;
      }
    } as UcZoomViewManager;

    component['zoomViewManager'] = zoomViewManagerFake;

    expect(component.isReady).toBeFalse();
  });

  it('.ucZoomOn setter should turn on or off the zoom on the manager', () => {
    const zoomViewManagerFake = {
      destroy() {},
      turnedOn: false,
      finishZoom() {},
      get isReady() {return false}
    } as UcZoomViewManager;

    component['zoomViewManager'] = zoomViewManagerFake;

    component.ucZoomOn = true;
    fixture.detectChanges();

    expect(zoomViewManagerFake.turnedOn).toBeTrue();

    component.ucZoomOn = false;
    fixture.detectChanges();

    expect(zoomViewManagerFake.turnedOn).toBeFalse();
  });

  it('.ucZoomOn setter with input false but component ready should finish the zoom', () => {
    const zoomViewManagerFake = {
      destroy() {},
      turnedOn: true,
      finishZoom() {},
      get isReady() {return true}
    } as UcZoomViewManager;

    spyOn(zoomViewManagerFake, 'finishZoom');

    component['zoomViewManager'] = zoomViewManagerFake;

    component.ucZoomOn = false;
    fixture.detectChanges();

    expect(zoomViewManagerFake.finishZoom).toHaveBeenCalled();
  });

  it('.ucZoomOn getter should return the manager zoom status (on or off)', () => {
    component.ucZoomOn =  true;
    expect(component.ucZoomOn).toBeTrue();

    component.ucZoomOn =  false;
    expect(component.ucZoomOn).toBeFalse();
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
    const config = ucZoomViewComponent['zoomViewManager'].config;

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

  it('should properly expose the container', () => {
    const container = component.ucZoomViewComponent.container;

    expect(container).toBe(wrapperDiv);
  });

  it('should properly expose the zoom lens', () => {
    const lens = component.ucZoomViewComponent.zoomLens;

    expect(lens).toBe(wrapperDiv.querySelector('div.uc-img-zoom-lens'));
  });

  it('should properly expose the zoom result view', () => {
    const zoomView = component.ucZoomViewComponent.zoomView;

    expect(zoomView).toBe(wrapperDiv.querySelector('div.uc-img-zoom-result'));
  });

  it('should properly expose the image', () => {
    const internalImage = component.ucZoomViewComponent.image;

    expect(internalImage).toBe(image);
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

  it('should not display zoom when turned off', () => {
    component.on = false;
    fixture.detectChanges();

    const ucZoomViewComponent = component.ucZoomViewComponent;

    spyOn<any>(ucZoomViewComponent['zoomViewManager'], 'startZoom');

    (ucZoomViewComponent['zoomViewManager'] as UcZoomViewImageManager)['onImgMouseEnter'](new MouseEvent('mouseenter'));

    expect(ucZoomViewComponent['zoomViewManager']['startZoom']).not.toHaveBeenCalled();

    spyOn<any>(ucZoomViewComponent['zoomViewManager'], 'calculateLensPosition');

    (ucZoomViewComponent['zoomViewManager'] as UcZoomViewImageManager)['onImgMouseMove'](new MouseEvent('mousemove'));

    expect(ucZoomViewComponent['zoomViewManager']['calculateLensPosition']).not.toHaveBeenCalled();

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
