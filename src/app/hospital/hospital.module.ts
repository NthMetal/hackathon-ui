import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HospitalRoutingModule } from './hospital-routing.module';
import { HospitalComponent } from './hospital.component';


@NgModule({
  declarations: [
    HospitalComponent
  ],
  imports: [
    CommonModule,
    HospitalRoutingModule
  ]
})
export class HospitalModule { }
