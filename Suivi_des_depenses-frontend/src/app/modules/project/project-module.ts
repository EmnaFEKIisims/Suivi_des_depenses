import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectRoutingModule } from './project-routing-module';
import { CreateProject } from './components/create-project/create-project';
import { ProjectList } from './components/project-list/project-list';
import { UpdateProject } from './components/update-project/update-project';
import { ReactiveFormsModule } from '@angular/forms';
import { ProjectDetails } from './components/project-details/project-details';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';




@NgModule({
  declarations: [
    
    ProjectList,
    UpdateProject, 
    ProjectDetails
  ],
  imports: [
    
    CommonModule,
    ProjectRoutingModule,
    ReactiveFormsModule,
    CreateProject,
    FormsModule,
    NgSelectModule
  ]
})
export class ProjectModule { }
