# ngx-uc #

An image zoom library for Angular projects.

## Project status ##

Ngx-uc is currently under development and there is still no releases yet. Try it at your own risk.

[The changelog](https://github.com/fabio-blanco/ngx-uc/blob/master/CHANGELOG.md) details the 
progress of the work.

## Getting Started ##

1. To install the ngx-uc, open a terminal and at the root of your project, run:
   ```shell
   npm install ngx-uc
   ```
2. Import the style in your `angular.json` file in the styles entry (project > architect > build > styles):
   ```json
   "styles": [
     "node_modules/ngx-uc/resources/uc.css",
     "src/styles.css"
   ]
   ```
   
3. Import the module:
   ```typescript
   import { NgModule } from '@angular/core';

   import { NgxUcModule } from 'ngx-uc';

   import { AppRoutingModule } from './app-routing.module';
   import { AppComponent } from './app.component';

   @NgModule({
     declarations: [
       AppComponent
    ],
    imports: [
      BrowserModule,
      AppRoutingModule,
      NgxUcModule
    ],
    providers: [],
      bootstrap: [AppComponent]
   })
   export class AppModule { }
   ```
   
4. In a template, add the `uc-zoom` directive to an image tag:
   ```html
   <img src="your-image.jpg" uc-zoom >
   ```

## Copyright and license ##

Code and documentation copyright 2021 Fabio M. Blanco. Code released under the
[MIT License](https://github.com/fabio-blanco/ngx-uc/blob/master/LICENSE)
