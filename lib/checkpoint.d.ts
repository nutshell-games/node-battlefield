/// <reference path="../typings/tsd.d.ts" />
import { Coordinate } from "./geometry";
import { BattleUnit } from "./battleUnit";
export declare class Trigger {
}
export declare class Checkpoint {
    point: Coordinate;
    triggers: Trigger[];
    unitsPresent: BattleUnit[];
    unitsEntering: BattleUnit[];
    constructor(point: Coordinate);
}
export declare class PlayerHQ extends Checkpoint {
}
