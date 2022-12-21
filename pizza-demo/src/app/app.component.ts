import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  styleUrls: ['app.component.scss'],
  template: `
  <div class="app">
    <div class="app__header">
      <img src="/assets/img/logo.svg" class="app__logo">
    </div>
    <div class="app__content">
      <div class="app__nav">
        <a routerLink="products" routerLinkActive="active">Products</a>
      </div>
      <div class="app__container">
        <router-outlet></router-outlet>
      </div>
      <div class="app__footer">
        <p>&copy; Ultimate Pizza Inc.</p>
      </div>
    </div>
  </div>
  `,
})
export class AppComponent {}
