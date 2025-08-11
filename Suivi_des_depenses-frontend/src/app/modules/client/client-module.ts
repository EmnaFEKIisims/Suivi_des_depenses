import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientRoutingModule } from './client-routing-module';
import { ClientList } from './components/client-list/client-list';
import { ClientDetails } from './components/client-details/client-details';
import { CreateClient } from './components/create-client/create-client';
import { UpdateClient } from './components/update-client/update-client';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ClientList,
    ClientDetails,
    CreateClient,
    UpdateClient
  ],
  imports: [
    CommonModule,
    FormsModule,
    ClientRoutingModule,
    ReactiveFormsModule 
  ]
})
export class ClientModule { }
