import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  { 
    path: 'home', 
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
  { 
    path: 'oxygensupply', 
    loadChildren: () => import('./oxygen-supply/oxygen-supply.module').then(m => m.OxygenSupplyModule) 
  },
  { 
    path: 'hospital', 
    loadChildren: () => import('./hospital/hospital.module').then(m => m.HospitalModule) 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
