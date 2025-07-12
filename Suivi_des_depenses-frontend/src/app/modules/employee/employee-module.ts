import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeRoutingModule } from './employee-routing-module';
import { CreateEmployee } from './components/create-employee/create-employee';
import { UpdateEmployee } from './components/update-employee/update-employee';
import { EmployeeDetails } from './components/employee-details/employee-details';
import { EmployeeList } from './components/employee-list/employee-list';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    CreateEmployee,
    UpdateEmployee,
    EmployeeDetails,
    EmployeeList
  ],
  imports: [
    CommonModule,
    EmployeeRoutingModule,
    ReactiveFormsModule
  ]
})
export class EmployeeModule { }
