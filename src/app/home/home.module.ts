import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';

import { ChartModule } from 'angular-highcharts';

import { MatCardModule } from '@angular/material/card';


@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    ChartModule,
    MatCardModule
  ]
})
export class HomeModule { }
