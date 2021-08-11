import {RequiredUcCssClasses, UcCssClasses} from "../uc-css-classes";

export interface UcZoomViewConfig {
  cssClasses?: UcCssClasses;
}

export interface EnforcedUcZoomViewConfig {
  cssClasses: RequiredUcCssClasses;
}


export const UC_ZOOM_VIEW_DEFAULT_CONFIG: EnforcedUcZoomViewConfig = {
  cssClasses: {
    imageContainer: 'uc-img-container',
    lens: 'uc-img-zoom-lens',
    zoomView: 'uc-img-zoom-result',
    hideLens: 'uc-hide-lens'
  }
};
