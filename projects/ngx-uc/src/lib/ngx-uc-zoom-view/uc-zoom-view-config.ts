import {RequiredUcCssClasses, UcCssClasses} from "../uc-css-classes";

export interface UcZoomViewConfig {
  cssClasses?: UcCssClasses;
  resetExtViewOnMouseLeave?: boolean;
  viewPosition?: UcZoomViewPosition;
  viewDistance?: number;
}

export interface EnforcedUcZoomViewConfig {
  cssClasses: RequiredUcCssClasses;
  resetExtViewOnMouseLeave: boolean;
  viewPosition: UcZoomViewPosition;
  viewDistance: number;
}

export enum UcZoomViewPosition {
  LEFT = 'left',
  RIGHT = 'right',
  TOP = 'top',
  BOTTOM = 'bottom'
}

export const UC_ZOOM_VIEW_DEFAULT_CONFIG: EnforcedUcZoomViewConfig = {
  cssClasses: {
    imageContainer: 'uc-img-container',
    lens: 'uc-img-zoom-lens',
    zoomView: 'uc-img-zoom-result',
    hideLens: 'uc-hide-lens'
  },
  resetExtViewOnMouseLeave: true,
  viewPosition: UcZoomViewPosition.RIGHT,
  viewDistance: 0
};
