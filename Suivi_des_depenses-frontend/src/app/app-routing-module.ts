import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateEmployee } from './modules/employee/components/create-employee/create-employee';
import { EmployeeList } from './modules/employee/components/employee-list/employee-list';
import { UpdateEmployee } from './modules/employee/components/update-employee/update-employee';


const routes: Routes = [

  {path: '', component: CreateEmployee} ,
  {path: 'employees', component: EmployeeList },
  { path: 'update-employee/:cin', component: UpdateEmployee },
  {path: 'add-employee', component: CreateEmployee }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
