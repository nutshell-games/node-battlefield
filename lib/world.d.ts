/// <reference path="../typings/tsd.d.ts" />
import BF = require("./battleUnit");
import G = require("./geometry");
declare class World {
    timeLoop: any;
    frameDuration: number;
    currentTime: number;
    units: BF.BattleUnit[];
    terrain: any[];
    entities: any[];
    constructor(frameDuration: number);
    start(): void;
    stop(): void;
    advanceFrame(): void;
    spawnUnit(unit: BF.BattleUnit, location: G.Point): void;
    private getCurrentState(currentTime);
    broadcast(): void;
}
export = World;
