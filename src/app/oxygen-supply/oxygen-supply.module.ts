import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OxygenSupplyRoutingModule } from './oxygen-supply-routing.module';
import { OxygenSupplyComponent } from './oxygen-supply.component';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [
    OxygenSupplyComponent
  ],
  imports: [
    CommonModule,
    OxygenSupplyRoutingModule,
    MatCardModule,
    MatTableModule,
  ]
})
export class OxygenSupplyModule { }
