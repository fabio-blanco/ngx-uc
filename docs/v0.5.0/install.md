---
layout: docs
version: 0.5.0
---

## Installation

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
