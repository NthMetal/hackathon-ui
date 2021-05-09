import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OxygenSupplyRoutingModule } from './oxygen-supply-routing.module';
import { OxygenSupplyComponent } from './oxygen-supply.component';
import { MaterialModule } from '../material.module';

import { ChartModule } from 'angular-highcharts';


@NgModule({
  declarations: [
    OxygenSupplyComponent
  ],
  imports: [
    CommonModule,
    ChartModule,
    OxygenSupplyRoutingModule,
    MaterialModule
  ]
})
export class OxygenSupplyModule { }
