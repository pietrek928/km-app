import { Observable } from 'rxjs';
import { Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import {
  HttpClientModule,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { SaveComponent } from './save/save.component';
import { LoginComponent } from './login/login.component';
import { AppComponent } from './app.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { environment } from 'src/environments/environment';

@Injectable()
class CredentialsInterceptor implements HttpInterceptor {
  constructor() {}
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    request = request.clone({
      withCredentials: true,
    });
    return next.handle(request);
  }
}

const INTERCEPTOTS = environment.production
  ? []
  : [
      {
        provide: HTTP_INTERCEPTORS,
        useClass: CredentialsInterceptor,
        multi: true,
      },
    ];

const MAT_MODULES = [
  MatCardModule,
  MatButtonModule,
  MatInputModule,
  MatFormFieldModule,
];

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    ...MAT_MODULES,
    RouterModule.forRoot(
      [
        { path: '', component: LoginComponent },
        { path: 'login', component: LoginComponent },
        { path: 'save', component: SaveComponent },
      ],
      { useHash: true }
    ),
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    ...INTERCEPTOTS,
  ],
  declarations: [AppComponent, LoginComponent, SaveComponent],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {}
}
