import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { EmployeeModule } from './modules/employee/employee-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProjectModule } from './modules/project/project-module';
import { RequestModule } from './modules/request/request-module';
import { Home } from './modules/home/home';
import { NgSelectModule } from '@ng-select/ng-select';
import { ClientModule } from './modules/client/client-module';
import { ClientList } from './modules/client/components/client-list/client-list';
import { CreateClient } from './modules/client/components/create-client/create-client';
import { Login } from './modules/login/login';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthModule } from './modules/auth/auth-module';
import { AuthInterceptor } from './modules/auth/interceptors/auth-interceptor';
import { Profile } from './modules/profile/profile/profile';

@NgModule({
  declarations: [App, Home, Login, Profile],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EmployeeModule,
    ClientModule,
    ProjectModule,
    NgSelectModule,
    RequestModule,
    AuthModule,
    ClientList,
    CreateClient,
    ReactiveFormsModule
  ],
  providers: [

  {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }

  ],
  bootstrap: [App]
})
export class AppModule {}