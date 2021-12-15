import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';

import * as mapboxgl from 'mapbox-gl';

interface MarcadorColor {

  color: string;
  marcador?: mapboxgl.Marker;
  centro?: [number, number];
};

@Component({
  selector: 'app-marcadores',
  templateUrl: './marcadores.component.html',
  styles: [
  
    `
      .mapa-container {

        width: 100%;
        height: 100%;
      }

      li {

        cursor: pointer;
      }
    `
  ],
})
export class MarcadoresComponent implements AfterViewInit, OnDestroy {

  public mapa!: mapboxgl.Map;

  public zoomLevel: number = 12.40;

  public center: [number, number] = [-58.438296572466726, -34.60621120094729];

  public marcadores: MarcadorColor[] = [].splice(0, 10);

  @ViewChild('mapa') divMapa!: ElementRef;

  ngAfterViewInit(): void {

    this.mapa = new mapboxgl.Map({

      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.center,
      zoom: this.zoomLevel,
    });

    this.leerLocalStorage();

    this.mapa.on('move', (event) => {

      const {lng, lat} = event.target.getCenter();

      this.center = [lng,lat]
    });
  };

  ngOnDestroy(): void {
   
    this.mapa.off('move', () => {});
  };

  agregarMarcador(): void {

    if ( this.marcadores.length === 10 ) {

      return;
    };

    const color: string = "#xxxxxx".replace( /x/g, y=>(Math.random()*16|0).toString(16) );

    const nuevoMarcador = new mapboxgl.Marker({

      draggable: true,
      color,
    })
    .setLngLat(this.center)
    .addTo(this.mapa);

    this.marcadores.push({

      color,
      marcador: nuevoMarcador,
    });

    // Guardamos en el Local Storage cuando se crea un nuevo marcador.

    this.guardarLocalStorage();

    // Guardamos en el Local Storage cuando se mueve un marcador.

    nuevoMarcador.on('dragend', () => {

      this.guardarLocalStorage();
    })
  };

  borrarMarcador(index: number, marcador: mapboxgl.Marker): void {

    marcador.remove();

    this.marcadores.splice(index, 1);

    this.guardarLocalStorage();
  };

  irMarcador(marcador: mapboxgl.Marker): void {

    const {lng, lat} = marcador.getLngLat();

    this.mapa.flyTo( { 
      
      center: [lng, lat],
    });
  };

  guardarLocalStorage(): void {

    const marcadoresLoclaStorage: MarcadorColor[] = this.marcadores.map( marcador => {

      const {lng, lat} = marcador.marcador!.getLngLat();

      return {
        
        color: marcador.color,
        centro: [lng, lat],
      };
    });

    localStorage.setItem('marcadores', JSON.stringify(marcadoresLoclaStorage) );
  };

  leerLocalStorage(): void {

    if ( !localStorage.getItem('marcadores') ) {

      return;
    };

    const nuevosMarcadores: MarcadorColor[] = JSON.parse( localStorage.getItem('marcadores')! );

    nuevosMarcadores.forEach( marcador => {

      const nuevoMarcador = new mapboxgl.Marker({

        draggable:true,
        color: marcador.color,
      })
      .setLngLat(marcador.centro!)
      .addTo(this.mapa);

      this.marcadores.push({

        color: marcador.color,
        marcador: nuevoMarcador!,
      });

      nuevoMarcador.on('dragend', () => {

        this.guardarLocalStorage();
      })
    });
  };
};
