import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateEmployee } from './modules/employee/components/create-employee/create-employee';
import { EmployeeList } from './modules/employee/components/employee-list/employee-list';
import { UpdateEmployee } from './modules/employee/components/update-employee/update-employee';
import { ProjectList } from './modules/project/components/project-list/project-list';
import { CreateProject } from './modules/project/components/create-project/create-project';
import { UpdateProject } from './modules/project/components/update-project/update-project';
import { RequestList } from './modules/request/component/request-list/request-list';
import { CreateRequest } from './modules/request/component/create-request/create-request';
import { UpdateRequest } from './modules/request/component/update-request/update-request';
import { RequestDetails } from './modules/request/component/request-details/request-details';
import { ProjectDetails } from './modules/project/components/project-details/project-details';
import { EmployeeDetails } from './modules/employee/components/employee-details/employee-details';
import { Home } from './modules/home/home';
import { ClientList } from './modules/client/components/client-list/client-list';
import { UpdateClient } from './modules/client/components/update-client/update-client';
import { CreateClient } from './modules/client/components/create-client/create-client';
import { ClientDetails } from './modules/client/components/client-details/client-details';



const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'employees', component: EmployeeList },
  { path: 'update-employee/:CIN', component: UpdateEmployee },
  { path: 'add-employee', component: CreateEmployee },
  { path: 'employees/details/:reference', component: EmployeeDetails },
  { path: 'clients', component: ClientList },
  { path: 'update-client/:idClient', component: UpdateClient },
  { path: 'add-client', component: CreateClient },
  { path: 'clients/details/:idClient', component: ClientDetails },
  { path: 'projects', component: ProjectList },
  { path: 'add-project', component: CreateProject }, 
  { path: 'projects/edit/:id', component: UpdateProject }, 
  { path: 'projects/:id', component: ProjectDetails },   
  { path: 'requests', component: RequestList },
  { path: 'requests/add', component: CreateRequest },        
  { path: 'requests/edit/:id', component: UpdateRequest },    
  { path: 'requests/:id', component: RequestDetails }          
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
