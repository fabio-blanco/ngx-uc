import {UcCoordinates} from "../uc-coordinates";
import {UcZoomViewComponent} from "./uc-zoom-view.component";

export interface UcZoomViewEventCallbacks {
  lensPositionUpdateEvent: LensPositionUpdateCallback;
  readyEvent: ZoomViewerReady;
  zoomStarted: ZoomStarted;
  zoomEnded: ZoomEnded;
  imageSourceChanged: ImageSourceChanged;
  resizeLensDimensions: ResizeLensDimensions;
}

export class UcZoomViewReadyEvent {
  component!: UcZoomViewComponent;
}

export class UcZoomViewImageSourceChangedEvent {
  constructor(public readonly newValue: string,
              public readonly oldValue: string) {
  }
}

export class UcZoomViewResizeLensDimensionsEvent {
  constructor(public readonly newValue: number,
              public readonly oldValue: number | null) {
  }
}

export type LensPositionUpdateCallback = (coordinates: UcCoordinates) => void;

export type ZoomViewerReady = (readyEvent: UcZoomViewReadyEvent) =>  void;

export type ZoomStarted = () => void;

export type ZoomEnded = () => void;

export type ImageSourceChanged = (event: UcZoomViewImageSourceChangedEvent) => void;

export type ResizeLensDimensions = (event: UcZoomViewResizeLensDimensionsEvent) => void;
