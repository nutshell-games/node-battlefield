/// <reference path="../typings/tsd.d.ts" />
export interface Frame {
    center: {
        x: number;
        y: number;
    };
    height: number;
    width: number;
}
export declare class Terrain {
    bounding: any[];
    typeId: string;
    z: number;
    frame: Frame;
}
export declare class Map {
    terrain: Terrain[];
    constructor(width: number, height: number);
    generateTerrain(terrainConfig: any[]): void;
    getTerrainAtPoint(x: number, y: number): Terrain[];
}
