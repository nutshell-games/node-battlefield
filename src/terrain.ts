/// <reference path="../typings/tsd.d.ts"/>

import _ = require("lodash");

  export interface Frame {
    center: {x:number, y:number};
    height:number;
    width:number;
  }

  export class Terrain {
    bounding: any[]; // Bezier curve points
    typeId: string;
    z: number;
    frame: Frame;
  }

  export class Map {
    terrain: Terrain[];

    constructor( width:number, height:number ) {

    }

    generateTerrain( terrainConfig:any[] ) {

      _.each(terrainConfig, function(terrainData:any){
        this.terrain.push(new Terrain());
      },this);
    }

    getTerrainAtPoint( x:number, y:number ):Terrain[] {

      return [];
    }
  }
