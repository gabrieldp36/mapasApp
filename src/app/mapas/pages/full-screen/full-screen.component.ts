import { AfterViewInit, Component } from '@angular/core';

import Swal from 'sweetalert2';

import { PlacesService } from '../../services/places.service';

@Component({

  selector: 'app-full-screen',
  templateUrl: './full-screen.component.html',
  styles: [

    `
      .loading-location {

        width: 100vw;
        height: 100vh;
      }

    `
  ],
})
export class FullScreenComponent implements AfterViewInit {

 
  get userLocationReady(): boolean {

    return this.placesServices.isUserLocationReady;
  };

  get errorLocation(): boolean {

    return this.placesServices.errorLocation;
  };

  constructor (private placesServices: PlacesService) {};

  async ngAfterViewInit() {

    if (!navigator.geolocation) {
    
      Swal.fire( 'Error' , 'El navegador no soporta la geolocalización.', 'error');

    } else {

      await this.placesServices.getUserLocation().then();
    };
  };
};
