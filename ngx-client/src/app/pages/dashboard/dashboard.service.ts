import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { BaThemeConfigProvider, colorHelper, layoutPaths } from '../../theme';

import { environment } from '../../../environments/environment';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import * as io from 'socket.io-client';

@Injectable()
export class DashboardService {

  private firstDate = new Date();
  private socket;

  constructor(
    private http: Http,
    private _baConfig: BaThemeConfigProvider,
  ) {}

  getChartConfiguration(data) {
    const layoutColors = this._baConfig.get().colors;
    const graphColor = this._baConfig.get().colors.custom.dashboardLineChart;

    return {
      type: 'serial',
      theme: 'blur',
      marginTop: 15,
      marginRight: 15,
      responsive: {
        'enabled': true,
      },
      dataProvider: data,
      categoryField: 'timestamp',
      categoryAxis: {
        minPeriod: 'ss',
        parseDates: true,
        gridAlpha: 0,
        color: layoutColors.defaultText,
        axisColor: layoutColors.defaultText,
        dateFormats: [
          { period: 'fff', format: 'JJ:NN:SS' },
          { period: 'ss', format: 'JJ:NN:SS' },
          { period: 'mm', format: 'JJ:NN' },
          { period: 'hh', format: 'JJ:NN' },
          { period: 'DD', format: 'MMM DD' },
        ],
      },
      valueAxes: [
        {
          minVerticalGap: 50,
          gridAlpha: 0,
          color: layoutColors.defaultText,
          axisColor: layoutColors.defaultText,
        },
      ],
      graphs: [
        {
          id: 'g0',
          bullet: 'none',
          useLineColorForBulletBorder: true,
          lineColor: colorHelper.hexToRgbA(graphColor, 0.3),
          lineThickness: 1,
          negativeLineColor: layoutColors.danger,
          type: 'smoothedLine',
          valueField: 'temperature',
          fillAlphas: 1,
          fillColorsField: 'lineColor',
        },
        {
          id: 'g1',
          bullet: 'none',
          useLineColorForBulletBorder: true,
          lineColor: colorHelper.hexToRgbA(graphColor, 0.15),
          lineThickness: 1,
          negativeLineColor: layoutColors.danger,
          type: 'smoothedLine',
          valueField: 'humidity',
          fillAlphas: 1,
          fillColorsField: 'lineColor',
        },
      ],
      chartCursor: {
        categoryBalloonDateFormat: 'DD MM YYYY - HH:NN:SS',
        categoryBalloonColor: '#4285F4',
        categoryBalloonAlpha: 0.7,
        cursorAlpha: 0,
        valueLineEnabled: true,
        valueLineBalloonEnabled: true,
        valueLineAlpha: 0.5,
      },
      dataDateFormat: 'DD MM YYYY - HH:NN:SS',
      export: {
        enabled: true,
      },
      creditsPosition: 'bottom-right',
      zoomOutButton: {
        backgroundColor: '#fff',
        backgroundAlpha: 0,
      },
      zoomOutText: '',
      pathToImages: layoutPaths.images.amChart,
    };
  }

  getLastHour() {
    const path = `${environment.base_url}/readings/`;    
    return this.http.get(path)
      .toPromise()
      .then(response => response.json());
  }

  getMessages() {
    const observable = new Observable(observer => {
      this.socket = io(environment.socket_url);
      this.socket.on('message', (data) => {
        observer.next(JSON.parse(data.text));
      });
      return () => {
        this.socket.disconnect();
      }; 
    })    
    return observable;
  }

  parseDataArray(data) {
    const parsedData = [];
    
    for (const element of data) {
      parsedData.push(this.parseDataElement(element));
    }
    return parsedData;
  }

  parseDataElement(element) {
    const newDate = new Date( this.firstDate );
    newDate.setTime( element.timestamp * 1 );
    return {
      timestamp: newDate,
      temperature: parseInt(element.temperature),
      humidity: parseInt(element.humidity),
    };
  }
}
