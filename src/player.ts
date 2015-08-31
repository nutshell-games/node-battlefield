/// <reference path="../typings/tsd.d.ts"/>
import BF = require("./battleUnit");
//import BattleUnit from './battleUnit';

export interface PlayerOptions {
  lifeTotal:number;
  username:string;
  userID:string;
  teamID:string;
}

export class Player {
    //battleUnitsOwned:BattleUnit[];
    lifeTotal:number;
    username:string;
    userID:string;
    teamID:string;

    //battleUnits:BattleField.BattleUnit[];

    basesControlled:any[];
    energyReserve:any[];
    unitsOwned:BF.BattleUnit[] = [];
    unitsControlled:BF.BattleUnit[] = [];

    //cardsInHand:Card[];

    constructor(options:PlayerOptions) {
      this.lifeTotal = options.lifeTotal;
      this.username = options.username;
      this.userID = options.userID;
      this.teamID = options.teamID;
    }

   fieldUnit(unit:BF.BattleUnit) {
     this.unitsOwned.push(unit);
     this.unitsControlled.push(unit);
     unit.owner = this;
     unit.controller = this;
   }
}
