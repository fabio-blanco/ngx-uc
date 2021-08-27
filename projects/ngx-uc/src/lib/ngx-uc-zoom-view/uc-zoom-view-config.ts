import {RequiredUcCssClasses, UcCssClasses} from "../uc-css-classes";

export interface UcZoomViewConfig {
  cssClasses?: UcCssClasses;
  resetExtViewOnMouseLeave?: boolean;
  viewPosition?: UcZoomViewPosition;
  viewDistance?: number;
  lensOptions?: {
    automaticResize?: boolean,
    sizeProportion?: number | UcLensProportionInferred,
    baseProportionType?: UcZoomViewLensProportionType
  };
  autoInitialize?: boolean;
}

export interface EnforcedUcZoomViewConfig {
  cssClasses: RequiredUcCssClasses;
  resetExtViewOnMouseLeave: boolean;
  viewPosition: UcZoomViewPosition;
  viewDistance: number;
  lensOptions: {
    automaticResize: boolean,
    sizeProportion: number | UcLensProportionInferred,
    baseProportionType: UcZoomViewLensProportionType
  };
  autoInitialize: boolean;
}

export type UcLensProportionInferred = 'inferred';

export enum UcZoomViewPosition {
  LEFT = 'left',
  RIGHT = 'right',
  TOP = 'top',
  BOTTOM = 'bottom'
}

export enum UcZoomViewLensProportionType {
  WIDTH, HEIGHT, BIGGER_SIZE, SMALLER_SIZE
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
  viewDistance: 0,
  lensOptions: {
    automaticResize: true,
    sizeProportion: 'inferred',
    baseProportionType: UcZoomViewLensProportionType.WIDTH
  },
  autoInitialize: true
};
