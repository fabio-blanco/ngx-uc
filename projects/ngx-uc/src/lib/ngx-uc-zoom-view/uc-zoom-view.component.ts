import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2} from '@angular/core';
import {UcZoomViewConfig} from "./uc-zoom-view-config";
import {UcCoordinates} from "../uc-coordinates";
import {UcZoomViewManager} from "./uc-zoom-view-manager";
import {UcZoomViewImageManager} from "./uc-zoom-view-image-manager";

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

  get ucZoomOn() {
    return this._ucZoomOn;
  }

  @Output()
  ucZoomOnChange = new EventEmitter<boolean>();

  get isReady() {
    return this.zoomViewManager.isReady;
  }

  private zoomViewManager!: UcZoomViewManager;

  constructor(private elRef:ElementRef,
              private renderer: Renderer2) { }

  ngOnInit(): void {

    this.zoomViewManager = new UcZoomViewImageManager(this.elRef,
                                                      this.renderer,
                                                      this.ucZoomResultView,
                                                      this.ucZoomViewConfig,
                                                      coordinates => this.lensPosition.emit(coordinates));

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
