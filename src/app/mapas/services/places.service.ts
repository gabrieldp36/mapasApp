import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import Swal from 'sweetalert2';

import { DirectionsApiClient } from '../api/directionsApiClient';

import { PlacesApiClient } from '../api/placesApiClient';

import { PlacesResponse } from '../interfaces/places';

import { DirecctionsResponse } from '../interfaces/directions';

@Injectable({

  providedIn: 'root'
})
export class PlacesService {

  public userLocation?: [number, number];

  public errorLocation: boolean = false;
  
  get isUserLocationReady(): boolean {

    return !!this.userLocation;
  };

  constructor(
    
    private placesApi: PlacesApiClient,

    private directionsApi: DirectionsApiClient,
    
  ) {};

  public async getUserLocation(): Promise<[number,number]> {

      return new Promise( (resolve, reject) => {

      setTimeout( () => {
          
        navigator.geolocation.getCurrentPosition(

          ( {coords} ) => {

            this.errorLocation = false;
            this.userLocation = [coords.longitude, coords.latitude]
            resolve(this.userLocation);
          },

          ( error ) => {

            this.errorLocation = true;
            console.log(error);
            Swal.fire( 'Error' , 'No se pudo obtener la geolocalización.', 'error');
            reject('No se pudo obtener la geolocalización.');
          },
        );
        
      }, 800);
    });
  };

  getPlaces(termino: string): Observable<PlacesResponse> {

    if(!this.userLocation) {

      throw Error('No se puede acceder a la geolocalización del usuario');
    };

    return this.placesApi.get<PlacesResponse>(`/${termino}.json`, {

      params: {

        proximity: this.userLocation?.join(','),
      },
    });
  };

  getDirections( start: [number, number], end: [number, number] ): Observable<DirecctionsResponse> {

    return this.directionsApi.get<DirecctionsResponse>(`/${start.join(',')};${end.join(',')}`);
  };
};
