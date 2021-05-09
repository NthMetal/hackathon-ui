import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HospitalRoutingModule } from './hospital-routing.module';
import { HospitalComponent } from './hospital.component';
import { MaterialModule } from '../material.module';


@NgModule({
  declarations: [
    HospitalComponent
  ],
  imports: [
    CommonModule,
    HospitalRoutingModule,
    MaterialModule
  ]
})
export class HospitalModule { }
