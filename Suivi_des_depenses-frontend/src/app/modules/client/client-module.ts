import { NgModule } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientRoutingModule } from './client-routing-module';
import { ClientDetails } from './components/client-details/client-details';
import { UpdateClient } from './components/update-client/update-client';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    ClientDetails
  ],
  imports: [
    CommonModule,
    ClientRoutingModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    UpdateClient
  ]
})
export class ClientModule {}