/// <reference path="../typings/tsd.d.ts" />
import BF = require("./battleUnit");
export interface PlayerOptions {
    lifeTotal: number;
    username: string;
    userID: string;
    teamID: string;
}
export declare class Player {
    lifeTotal: number;
    username: string;
    userID: string;
    teamID: string;
    basesControlled: any[];
    energyReserve: any[];
    unitsOwned: BF.BattleUnit[];
    unitsControlled: BF.BattleUnit[];
    constructor(options: PlayerOptions);
    fieldUnit(unit: BF.BattleUnit): void;
}
