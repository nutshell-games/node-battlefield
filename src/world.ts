/// <reference path="../typings/tsd.d.ts"/>

import BF = require("./battleUnit");
import G = require("./geometry");
import _ = require("lodash");

interface CurrentWorldState {
  units: any[];
  terrain: any[];
  entities: any[];
}

class World {
    timeLoop: any;
    frameDuration: number;
    currentTime: number = 0;
    units: BF.BattleUnit[] = [];
    terrain: any[] = [];
    entities: any[] = [];

    constructor(frameDuration:number){
      this.frameDuration = frameDuration;
    }

    start() {
      this.timeLoop = setInterval( this.advanceFrame.bind(this), this.frameDuration);
    }

    stop() {
      clearInterval(this.timeLoop);
    }

    advanceFrame() {
      this.currentTime+=this.frameDuration;
      console.log("current time:",this.currentTime);

      // TODO remove and add units
      var unitsToSpawn:any[] = [];

      // for each unit and entity, advance to next predicted position

      var currentState = this.getCurrentState(this.currentTime);
      //console.log(currentState);
      //this.broadcast();
    }

    spawnUnit(unit:BF.BattleUnit, location:G.Point) {
      unit.currentPosition = {
        x: location.x, y: location.y, orientation: null, speed:unit.baseMovementSpeed
      };
      this.units.push(unit);

      // TODO when to schedule movement action?
      var movementAction:BF.StartMovementAction = new BF.StartMovementAction(unit,this.frameDuration,true);
      unit.scheduleAction(movementAction);
    }

    private getCurrentState(currentTime:number) {
      var currentState: CurrentWorldState = {
        units: [], terrain: [], entities: []
      }

      _.each(this.units, function(unit:BF.BattleUnit){
        unit.updateState(this.frameDuration);

        // TODO publish only state deltas
        currentState.units.push(unit);
      },this);

      return currentState;
    }

    broadcast() {
      // currentState:CurrentWorldState
      // connections to clients
    }
}

export = World;
