import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-mini-mapa',
  templateUrl: './mini-mapa.component.html',
  styles: [

    `
      div {

        width: 100%;
        height: 150px;
        margin: 0px;
      }
    `
  ],
})
export class MiniMapaComponent implements AfterViewInit {

  @Input() lngLat: [number, number] = [0,0];

  @ViewChild('mapa') divMapa!: ElementRef;
  
  ngAfterViewInit(): void {

    const mapa = new mapboxgl.Map({

      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.lngLat,
      zoom: 15,
      // interactive:false,
    });

    const color: string = "#xxxxxx".replace( /x/g, y=>(Math.random()*16|0).toString(16) );

    new mapboxgl.Marker({

      draggable:true,
      color: color,
    })
    .setLngLat(this.lngLat)
    .addTo(mapa);
    
  };
};
