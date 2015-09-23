/// <reference path="../typings/tsd.d.ts"/>

import World = require("./world");
import {Coordinate} from "./geometry";
import {BattleUnit} from "./battleUnit";

// a checkpoint is a point on the battlefield that
// triggers action(s) when a unit reaches it

// how to check if a unit reached a checkpoint...
// all checkpoints registered on path
// on frame, check unit current position
// if position matches a checkpoint

// types of checkpoints
// Player HQ
// when enemy unit reaches it,
// deduct unit point value from player life
// destroy unit

export class Trigger {

}

export class Checkpoint {

  point:Coordinate;
  triggers:Trigger[];
  unitsPresent:BattleUnit[];
  unitsEntering:BattleUnit[];

  constructor(point:Coordinate) {

  }
}

export class PlayerHQ extends Checkpoint {

}
