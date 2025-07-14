import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { EmployeeModule } from './modules/employee/employee-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectList } from './modules/project/components/project-list/project-list';
import { ProjectModule } from './modules/project/project-module';


import { CreateProjectComponent } from './modules/project/components/create-project/create-project';

@NgModule({
  declarations: [
    App,
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    EmployeeModule,
    ProjectModule, 
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    CreateProjectComponent
  ],
  exports: [
    CreateProjectComponent
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
