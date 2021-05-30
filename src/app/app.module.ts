import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ChartModule } from 'angular-highcharts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { HttpClientModule } from '@angular/common/http';
import { GraphQLModule } from './graphql.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ChartModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    GraphQLModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
