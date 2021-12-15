import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-full-screen',
  templateUrl: './full-screen.component.html',
  styles: [

    `
      .mapa-container {

        width: 100%;
        height: 100%;
      }
    `
  ],
})
export class FullScreenComponent implements AfterViewInit {

  public mapa!: mapboxgl.Map;

  @ViewChild('mapa') divMapa!: ElementRef;

  public zoomLevel: number = 11;

  public center: [number, number] = [-58.438296572466726, -34.60621120094729];

  ngAfterViewInit(): void {

    this.mapa = new mapboxgl.Map({

      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.center,
      zoom: this.zoomLevel,
    });
  };
};
