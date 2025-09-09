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

@NgModule({
  declarations: [App, Home],
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
    ClientList,
    CreateClient
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule {}