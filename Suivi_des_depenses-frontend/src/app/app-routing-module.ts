import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateEmployee } from './modules/employee/components/create-employee/create-employee';
import { EmployeeList } from './modules/employee/components/employee-list/employee-list';
import { UpdateEmployee } from './modules/employee/components/update-employee/update-employee';
import { ProjectList } from './modules/project/components/project-list/project-list';
import { CreateProjectComponent } from './modules/project/components/create-project/create-project';
import { UpdateProject } from './modules/project/components/update-project/update-project';


const routes: Routes = [

  {path: '', component: CreateEmployee} ,
  {path: 'employees', component: EmployeeList },
  { path: 'update-employee/:cin', component: UpdateEmployee },
  {path: 'add-employee', component: CreateEmployee } ,
  { path: 'projects', component: ProjectList },
  {path: 'projects/edit/:id', component: UpdateProject },
  { path: 'add-project', component: CreateProjectComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
