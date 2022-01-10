import { Component } from '@angular/core';

export interface MenuItem {

  nombre: string;
  ruta: string
};

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styles: [

    `
      li {

        cursor: pointer;
      }
    `
  ]
})
export class MenuComponent  {

  public menu: MenuItem[] = [

    {
      nombre:'Geolocalización',
      ruta: './mapas/fullscreen',
    },

    {
      nombre:'Zoom',
      ruta: './mapas/zoom-range',
    },

    {
      nombre:'Marcadores',
      ruta: './mapas/marcadores'
    },

    {
      nombre:'Propiedades',
      ruta:'./mapas/propiedades',
    },
  ];

};
