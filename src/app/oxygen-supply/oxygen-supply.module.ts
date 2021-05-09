import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OxygenSupplyRoutingModule } from './oxygen-supply-routing.module';
import { OxygenSupplyComponent } from './oxygen-supply.component';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [
    OxygenSupplyComponent
  ],
  imports: [
    CommonModule,
    OxygenSupplyRoutingModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class OxygenSupplyModule { }
