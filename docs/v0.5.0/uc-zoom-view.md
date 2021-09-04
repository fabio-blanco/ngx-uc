---
layout: docs
version: 0.5.0
---

## uc-zoom-view component

uc-zoom-view is a component that displays a zoom view representing the magnification results of a lens
that follows the mouse pointer over the image.

### Basic usage

Before using this component, make sure you have made the proper installation of the
ngx-uc library. For more information see the [installation section](./index.html#installation).

This component modifies a html image tag and may be added as an empty attribute.

```html
<img src="your-image.jpg" uc-zoom-view >
```
This is all you have to do to initialize the component with all default configurations.

After initialized, the component will wrap the image within a container, so you should 
only interact with the image tag through the uc-zoom-view component and not directly.

```html
<!-- the html that your browser sees -->
<div class="uc-img-container">
    <div class="uc-img-zoom-lens"></div>
    <img src="your-image.jpg" uc-zoom-view >
    <div class="uc-img-zoom-result"></div>
</div>
```

### Customize appearance

The component can have its appearance customized in two different ways. Globally or with custom classes. Let's see the two approaches.

#### Global css customization

The general appearance of the components elements can be customized by overriding it's default css styles. The applied classes are: 

| Class Name                    | Elements affected                  |
| ------------------------------|------------------------------------|
| uc-img-container              | The wrapper container              |
| uc-img-zoom-lens              | The lens container                 |
| uc-img-zoom-result            | The zoom view container            |
| uc-hide-lens                  | Both zoom view and lens containers |

Those elements and classes are not shadowed so do not use local component styles. Do it on your global `styles.css` file.

#### Custom style classes

In situations when you will need a custom appearance for one specific `uc-zoom-view` component or even to have two different instances of the component
on the same page but styled differently, you can change the style class names of one of those instances by providing a custom configuration of the
`cssClasses` config properties.

```typescript
customConfig: UcZoomViewConfig = {
  cssClasses: {
    zoomView: 'custom-img-zoom-result',
    lens: 'custom-img-zoom-lens', 
    imageContainer: 'custom-img-container',
    hideLens: 'custom-hide-lens'
  }
}
```

The custom style classes also have to be defined on the general `styles.css` file.

### Using an external zoom view

You can use an external zoom view by defining a html div container on a template and binding it to the `uc-z-view` property of the `uc-zoom-view` component.

```html
<img src="assets/img/example-1200x746.jpg" [style]="{'width': '500px'}"
     uc-zoom-view [uc-z-view]="externalView" alt="Example image">

<div class="external-view" #externalView></div>
```

### Positioning the zoom view

When using the default internal zoom view, its position relates to the image position and can be configured to assume one of the possible 
values (LEFT, RIGHT, TOP, BOTTOM).

```typescript
customConfig: UcZoomViewConfig = {
  viewPosition: UcZoomViewPosition.LEFT,
  viewDistance: 20
};
```
The distance of the zoom view to the image can also be configured.

### Turning the component off

Sometimes it is useful to turn off the zoom feature. The `uc-zoom-view` offers programmatic  control over its functionality by turning it on or off.

```html
<img src="assets/img/example-1200x746.jpg" [style]="{'width': '500px'}"  
     uc-zoom-view [(ucZoomOn)]="on" alt="Example image"> <br>

<button (click)="toggleSwitch()">Turn Zoom {{!on ? 'on' : 'off'}}</button>
```

```typescript
on = true;

toggleSwitch(): void {
  this.on = !this.on;
}
```



### Component Properties

| Name                        | Type                    | Default              | Description                                                           |
|-----------------------------|-------------------------|----------------------|-----------------------------------------------------------------------|
| uc-zoom-view-config         | UcZoomViewConfig        | *See table below     | The starting configurations of the component                          |
| uc-z-view                   | HTML DIV tag            | undefined            | A div to be used as an external zoom view (when set, no internal view will be created) |
| ucZoomOn                    | boolean (getter and setter) | true                 | Turns the component on or off                                         |
| isReady                     | boolean (getter)        |                      | Returns if the component is ready (image is loaded and component initialized |
| container                   | HTML DIV tag (getter)   |                      | Returns the container wrapper div if the component is already initialized |
| zoomLens                    | HTML DIV tag (getter)   |                      | Returns the lens div if the component is already initialized           |
| zoomView                    | HTML DIV tag (getter)   |                      | Returns the zoom div if internal and if the component is already initialized |
| image                       | Image                   | The wrapped image    | Returns the host image                                                 |

### Configuration Properties (UcZoomViewConfig)

| Name                        | Type                    | Default              | Description                                                                  |
|-----------------------------|-------------------------|----------------------|------------------------------------------------------------------------------|
| cssClasses                  | UcCssClasses            | *see below           | Css class names to use on the components                                     |
| cssClasses.imageContainer   | string                  | 'uc-img-container'   | The class of the wrapper container div                                       |
| cssClasses.lens             | string                  | 'uc-img-zoom-lens'   | The class of the lens div                                                    |
| cssClasses.zoomView         | string                  | 'uc-img-zoom-result' | The class of the zoom view div                                               |
| cssClasses.hideLens         | string                  | 'uc-hide-lens'       | The class used in the hidden lens and view when the zoom is turned off       |
| resetExtViewOnMouseLeave    | boolean                 | true                 | If the external zoom view should be reset on mouse leave (only for external view) |
| viewPosition                | UcZoomViewPosition enum | RIGHT                | The zoom view position relative to the host image (possible values are: LEFT, RIGHT, TOP, BOTTOM) |
| viewDistance                | number                  | 0                    | The zoom view distance from the host image                                   |
| lensOptions                 | Object                  | *see below           | The lens option                                                              |
| lensOptions.automaticResize | boolean                 | true                 | If the lens dimensions will be automatically resized if hte host image gets resized |
| lensOptions.sizeProportion  | number &#124; 'inferred' | 'inferred'           | The size proportion related to the host image to be used to resize the lens when automatic resize is turned on |
| lensOptions.baseProportionType | UcZoomViewLensProportionType | WIDTH         | The base proportion type when resizing lens (possible values are: WIDTH, HEIGHT, BIGGER_SIZE, SMALLER_SIZE) |
| autoInitialize              | boolean                 | true                 | If the uc-zoom-view will automatically initialize on view initialization     |

### Methods

| Name                             | Description                                                                  |
|----------------------------------|------------------------------------------------------------------------------|
| initialize                       | Initializes the component if not initialized yet, else do nothing            |

### Events 

| Name                 | Type                 | Event properties                  | Description                                                          |
|----------------------|----------------------|-----------------------------------|----------------------------------------------------------------------|
| ucZoomOnChange       | boolean              | -                                 | Invoked if the uc-zoom-view component is turned on or off            |
| lensPosition         | UcCoordinates        | {x: number, y: number}            | Invoked when the lens position changes while mouse is over           |
| ready                | UcZoomViewReadyEvent | component: UcZoomViewComponent    | Invoked when the component is ready (image loaded and component initialized) |
| zoomStarted          | -                    | -                                 | Invoked when the zoom has started                                    |
| zoomEnded            | -                    | -                                 | Invoked when the zoom has sopped                                     |
| imageSrcChanged      | UcZoomViewImageSourceChangedEvent | newValue: string, oldValue: string | Invoked when the src property of the host image has changed |
| resizeLensDimensions | UcZoomViewResizeLensDimensionsEvent | newValue: number, oldValue: number &#124; null | Invoked when the lens dimensions were resized |

## Examples ##

A [live demo of the uc-zoom-view component](https://fabio-blanco.github.io/ngx-uc-example/zoom-view) is available to demonstrate
usage examples of the ngx-uc library components. The [source code of the examples](https://github.com/fabio-blanco/ngx-uc-example)
is also available if you want to take a look.
