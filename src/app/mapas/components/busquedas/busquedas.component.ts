import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

import * as mapboxgl from 'mapbox-gl';

import { delay, tap } from 'rxjs';

import { PlacesService } from '../../services/places.service';

import { Feature } from '../../interfaces/places';

import { Route } from '../../interfaces/directions';

@Component({

  selector: 'app-busquedas',
  templateUrl: './busquedas.component.html',
  styles: [

    `
      .mapa-container {

        width: 100vw;
        height: 100vh;
      }

      .pointer {

        cursor: pointer;
      }

      p {

        font-size: 12px;
      }

      .white {

        color: white;
      }

      #div-btn-resultados {

        position: fixed;
        top: 225px; 
        left: 27px; 
        z-index: 9999;
      }

      #btn-resultados {

        box-shadow: none;
        background: rgba(25,135,84,0.85);
        border-color: rgba(25,135,84,0.85);
        color: white;
        border-radius: 20px;
      }

      #btn-resultados:hover {

        background: rgba(25,135,84,0.65);
        border-color: rgba(25,135,84,0.65);
      }

      #btn-resultados:active {

        background: rgba(25,135,84,0.55);
        border-color: rgba(25,135,84,0.55);
      }

      .hidden {

        visibility: hidden !important;
      }

      .display {

        visibility: visible !important;
      }
    `
  ],
})
export class BusquedasComponent implements AfterViewInit {

  @ViewChild('mapa') divMapa!: ElementRef;

  public mapa!: mapboxgl.Map;

  public zoomLevel: number = 15;

  public debounceTime?: NodeJS.Timeout;

  public isLoadingPlaces: boolean = false;

  public places!:Feature[];

  public selectedId: string = '';

  public markers: mapboxgl.Marker[] = [];

  public polyLinePopup!: mapboxgl.Popup;

  public mostrarBtn: boolean = false;

  public esconderMostrarBuscador: boolean = false;

  get userLocationReady(): boolean {

    return this.placesServices.isUserLocationReady;
  };

  get errorLocation(): boolean {

    return this.placesServices.errorLocation;
  };

  constructor (private placesServices: PlacesService) {};

  async ngAfterViewInit() {

    this.mapa = new mapboxgl.Map({

      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.placesServices.userLocation,
      zoom: this.zoomLevel,
    });

    const popup = new mapboxgl.Popup({
      
    maxWidth: '100px',
    className: 'popup',
  })
    .setHTML(`<span> <b> Ubicación actual </b> </span>`);

    new mapboxgl.Marker({color: 'red'})
    .setLngLat(this.placesServices.userLocation!)
    .setPopup(popup)
    .addTo(this.mapa)
  };

  irUbicacionActual(): void {

    this.selectedId = '';

    this.mapa.flyTo( {

      zoom: 16.5,
      center: this.placesServices.userLocation,
    });
  };

  getSugerencias(event: KeyboardEvent, termino: string): void {

    if( (event.key === 'ArrowUp') || ( event.key === 'ArrowDown') 
          || (event.key === 'ArrowRight') || ( event.key ==='ArrowLeft' ) ) { 
    
      return; 
    };

    if(this.debounceTime) {

      clearTimeout(this.debounceTime);
    };

    if( termino.trim().length > 0 ) {

      this.debounceTime = setTimeout( () => {

        this.placesServices.getPlaces(termino)
        .pipe( 
          
          tap( (_) => {

            this.places = [];
            
            this.isLoadingPlaces = true
          }),

          delay(500) 
        )
        .subscribe( resp => {

          if( this.mapa.getLayer('RouteString') ) {

            this.mapa.removeLayer('RouteString');
  
            this.mapa.removeSource('RouteString');
  
            this.polyLinePopup.remove();
          };
    
          this.isLoadingPlaces = false;
          
          this.places = resp.features;

          this.createMarkersFromPlaces(this.places);

          (this.places.length > 0) ? this.mostrarBtn = true : this.mostrarBtn = false;
        });
      }, 350);

    } else {

      setTimeout( () => {

        this.mostrarBtn = false;

        this.selectedId = '';

        this.markers.forEach( marker => marker.remove() );

        if( this.mapa.getLayer('RouteString') ) {

          this.mapa.removeLayer('RouteString');

          this.mapa.removeSource('RouteString');

          this.polyLinePopup.remove();
        };

      }, 700);
    };
  };

  flyTo(places: Feature) {

    this.selectedId = places.id;

    const [lng, lat] = places.center;

    this.mapa.flyTo({

      zoom: 16,
      center: [lng, lat],
   })
  };

  createMarkersFromPlaces(places: Feature[]) {

    if(!this.placesServices.userLocation) { return; };

    this.markers.forEach( marker => marker.remove() );

    const newMarkers: mapboxgl.Marker[] = [];

    for (const place of places) {

      const [lng, lat] = place.center;

      const popup = new mapboxgl.Popup({

        className: 'popup',
      })
      .setHTML(`
         
        <h6> ${place.text_es} </h6>
        <span> ${place.place_name_es} </span>
      `);

      const newMarker = new mapboxgl.Marker( {color: '#7512a0'} )
      .setLngLat( [lng, lat] )
      .setPopup(popup)
      .addTo(this.mapa);
      
      newMarkers.push(newMarker);
    };

    this.markers = newMarkers;

    if(this.places.length === 0) { return; };

    // Ver todos los marcadores en pantalla, ajustando el zoom.

    const bounds = new mapboxgl.LngLatBounds();

    bounds.extend(this.placesServices.userLocation);

    newMarkers.forEach( marker => bounds.extend( marker.getLngLat() ) );
    
    this.mapa.fitBounds( bounds, {padding: 200} );
  };

  getDirections(place: Feature): void {

    if(!this.placesServices.userLocation) { return; };

    const start = this.placesServices.userLocation;

    const end = place.center as [number, number];

    this.placesServices.getDirections(start, end)
    .subscribe( resp => this.drawPolyline(resp.routes[0]) );
  };

  drawPolyline(route: Route): void {

    const coords = route.geometry.coordinates;

    const bounds = new mapboxgl.LngLatBounds();

    coords.forEach( ( [lng, lat] ) => bounds.extend([lng, lat]) );

    this.mapa.fitBounds(bounds, {

      padding: 200,
    });

    // Polyline

    if( this.mapa.getLayer('RouteString') ) {

      this.mapa.removeLayer('RouteString');

      this.mapa.removeSource('RouteString');

      this.polyLinePopup.remove();
    };

    const sourceData: mapboxgl.AnySourceData = {

      type: 'geojson',
      data: {

        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coords
            },
          },
        ],
      },
    };

    this.mapa.addSource('RouteString', sourceData);
    
    this.mapa.addLayer({

      id: 'RouteString',
      type: 'line',
      source:'RouteString',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#7b1fa2',
        "line-opacity": 1,
        "line-width": 3,
      },
    })

    const [lng, lat] = coords[coords.length -1];

    this.polyLinePopup = new mapboxgl.Popup({

      className: 'popup',
    })
    .setHTML(`
      <h6> Recorrido </h6>
      <span> Distancia: ${(route.distance / 1000).toFixed(1)} km. </span>
      <br>
      <span> Duración: ${Math.round(route.duration/ 60)} Min. </span>
    `)
    .setLngLat([lng,lat])
    .addTo(this.mapa);
  };

  // Ocultar o mostrar el buscador

  ocultarMostrarBuscador(): void {

    this.esconderMostrarBuscador = !this.esconderMostrarBuscador;
  };
};
