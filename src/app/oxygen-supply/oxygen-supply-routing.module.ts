import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OxygenSupplyComponent } from './oxygen-supply.component';

const routes: Routes = [{ path: '', component: OxygenSupplyComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OxygenSupplyRoutingModule { }
