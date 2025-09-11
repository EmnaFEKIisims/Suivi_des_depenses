import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RequestRoutingModule } from './request-routing-module';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { NgSelectModule } from '@ng-select/ng-select';
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { RequestList } from './component/request-list/request-list';
import { CreateRequest } from './component/create-request/create-request';
import { UpdateRequest } from './component/update-request/update-request';
import { RequestDetails } from './component/request-details/request-details';

@NgModule({
  declarations: [
    RequestList,
    CreateRequest,
    UpdateRequest,
    RequestDetails
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatCheckboxModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    RequestRoutingModule,
    NgSelectModule
  ],
  providers: [
    DatePipe,
    CurrencyPipe,
    DecimalPipe
  ]
})
export class RequestModule { }