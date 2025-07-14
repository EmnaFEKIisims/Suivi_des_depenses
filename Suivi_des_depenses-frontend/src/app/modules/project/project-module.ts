import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectRoutingModule } from './project-routing-module';
import { CreateProjectComponent } from './components/create-project/create-project';
import { ProjectList } from './components/project-list/project-list';
import { UpdateProject } from './components/update-project/update-project';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    
    ProjectList,
    UpdateProject
  ],
  imports: [
    CreateProjectComponent,
    CommonModule,
    ProjectRoutingModule,
    ReactiveFormsModule
  ]
})
export class ProjectModule { }
