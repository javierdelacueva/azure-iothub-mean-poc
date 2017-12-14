import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { DashboardComponent } from './dashboard.component';
import { DashboardService } from './dashboard.service';
import { routing } from './dashboard.routing';
 
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    routing,
  ],
  declarations: [
    DashboardComponent,
  ],
  providers: [
    DashboardService,
  ],
})

export class DashboardModule {}
