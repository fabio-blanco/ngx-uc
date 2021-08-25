import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2} from '@angular/core';
import {UcZoomViewConfig} from "./uc-zoom-view-config";
import {UcCoordinates} from "../uc-coordinates";
import {UcZoomViewManager} from "./uc-zoom-view-manager";
import {UcZoomViewImageManager} from "./uc-zoom-view-image-manager";
import {UcZoomViewImageSourceChangedEvent, UcZoomViewReadyEvent, UcZoomViewResizeLensDimensionsEvent} from "./uc-zoom-view-events";

@Component({
  selector: 'img[uc-zoom-view]',
  exportAs: 'ucZoomView',
  template: '<ng-content></ng-content>'
})
export class UcZoomViewComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input('uc-zoom-view-config')
  ucZoomViewConfig?: UcZoomViewConfig;

  @Input('uc-z-view')
  ucZoomResultView: any;

  private _ucZoomOn: boolean = true;

  @Input()
  set ucZoomOn(on: boolean) {
    this._ucZoomOn = on;
    if (this.zoomViewManager) {
      this.zoomViewManager.turnedOn = on;
      if (this.isReady && !on) {
        this.zoomViewManager.finishZoom();
      }
    }
    this.ucZoomOnChange.emit(on);
  }

  @Output()
  ucZoomOnChange = new EventEmitter<boolean>();

  @Output()
  lensPosition = new EventEmitter<UcCoordinates>();

  @Output()
  ready = new EventEmitter<UcZoomViewReadyEvent>();

  @Output()
  zoomStarted = new EventEmitter<any>();

  @Output()
  zoomEnded = new EventEmitter<any>();

  @Output()
  imageSrcChanged = new EventEmitter<UcZoomViewImageSourceChangedEvent>();

  @Output()
  resizeLensDimensions = new EventEmitter<UcZoomViewResizeLensDimensionsEvent>();

  get ucZoomOn() {
    return this._ucZoomOn;
  }

  get isReady() {
    return this.zoomViewManager.isReady;
  }

  get container() {
    return this.zoomViewManager.container;
  }

  get zoomLens() {
    return this.zoomViewManager.zoomLens;
  }

  get zoomView() {
    return this.zoomViewManager.zoomView;
  }

  get image() {
    return this.zoomViewManager.image;
  }

  private zoomViewManager!: UcZoomViewManager;

  constructor(private elRef:ElementRef,
              private renderer: Renderer2) { }

  ngOnInit(): void {

    this.zoomViewManager = new UcZoomViewImageManager(this.elRef,
                                                      this.renderer,
                                                      this.ucZoomResultView,
                                                      this.ucZoomViewConfig,
                                                      {
                                                        lensPositionUpdateEvent: coordinates => this.lensPosition.emit(coordinates),
                                                        readyEvent: readyEvent => {
                                                          readyEvent.component = this
                                                          this.ready.emit(readyEvent)
                                                        },
                                                        zoomStarted: () => this.zoomStarted.emit(null),
                                                        zoomEnded: () => this.zoomEnded.emit(null),
                                                        imageSourceChanged: event => this.imageSrcChanged.emit(event),
                                                        resizeLensDimensions: event => this.resizeLensDimensions.emit(event)
                                                      });

  }

  ngAfterViewInit(): void {
    this.zoomViewManager.turnedOn = this.ucZoomOn;
    this.zoomViewManager.initializeViewer();
  }

  ngOnDestroy(): void {
    if (this.zoomViewManager) {
      this.zoomViewManager.destroy();
    }
  }

}
