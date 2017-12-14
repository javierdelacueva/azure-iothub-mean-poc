import { Component, OnDestroy } from '@angular/core';
import { DashboardService } from './dashboard.service';

import * as moment from 'moment';

import 'style-loader!./dashboard.component.scss';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})

export class DashboardComponent implements OnDestroy {

  public chartDataRest: Object;
  public chartDataSocket: Object;  
  public connection: any;

  constructor(private dashboardService: DashboardService) {
    this.chartDataRest = this.dashboardService.getChartConfiguration([]);
    this.chartDataSocket = this.dashboardService.getChartConfiguration([]);    
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }

  initRestChart(chart: any) {
    this.dashboardService.getLastHour().then(sensors => {
      chart.dataProvider = this.dashboardService.parseDataArray(sensors);
      chart.validateData();
    });
  }

  initSocketChart(chart: any) {
    this.connection = this.dashboardService.getMessages().subscribe(message => {
      chart.dataProvider.push(this.dashboardService.parseDataElement(message));
      chart.validateData();      
    });
  }  
}
