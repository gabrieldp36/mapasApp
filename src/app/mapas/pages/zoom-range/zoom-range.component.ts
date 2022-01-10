import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';

import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-zoom-range',
  templateUrl: './zoom-range.component.html',
  styles: [

    `
      .mapa-container {

        width: 100vw;
        height: 100vh
      }

      .row {

        background-color: white;
        border-radius: 20px;
        width: 280px;
        bottom: 50px;
        left: 50px;
        padding: 10px;
        position: fixed;
        z-index: 999;
      }
    `
  ],
})
export class ZoomRangeComponent implements AfterViewInit, OnDestroy{
 
  public mapa!: mapboxgl.Map;

  public zoomLevel: number = 11;

  public center: [number, number] = [-58.438296572466726, -34.60621120094729];

  @ViewChild('mapa') divMapa!: ElementRef;

  ngAfterViewInit(): void {

    this.mapa = new mapboxgl.Map({

      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.center,
      zoom: this.zoomLevel,
    });

    this.mapa.on('zoom', ()=> this.zoomLevel = this.mapa.getZoom() );

    this.mapa.on('zoomend', ()=> {

      if( this.mapa.getZoom() > 18 ) {

        this.mapa.zoomTo(18);
      };
    });

    this.mapa.on('move', (event) => {

      const {lng, lat} = event.target.getCenter();

      this.center = [lng,lat]
    });
  };

  ngOnDestroy(): void {
   
    this.mapa.off('zoom', () => {});

    this.mapa.off('zoomend', () => {});

    this.mapa.off('move', () => {});
  };

  zoomOut(): void {

    this.mapa.zoomOut();
  };

  zoomIn(): void {

    this.mapa.zoomIn();
  };

  zoomRange(zoom:string): void {

    this.mapa.zoomTo( Number(zoom) );
  };
};
