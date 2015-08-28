/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../lib/tsd.d.ts" />

import BF = require("./battleUnit");
import World = require("./world");
import G = require("./geometry");
import Path = require("./pathing");

import _ = require("lodash");

const frameDuration = 1000;

var world =  new World(frameDuration);

var unit:BF.BattleUnit = new BF.BattleUnit(world, {
  classID:"elf",HP:100,baseMovementSpeed:10
});

console.log(unit.attributes["HP"]);

// BUILD MAP

// DEFINE PATHS

var endpointA = new G.Point(150,40), endpointB = new G.Point(105,150), controlPoint = new G.Point(80,30);

var curve = new G.BezierCurve(endpointA,controlPoint,endpointB);

var segments = curve.flatten(5);
var path = new Path(endpointA,endpointB,segments);

console.log("path Length",path.length);
console.log("path segments", path.segments.length);

world.spawnUnit(unit,endpointA);
console.log(world.units);

unit.setPathAndRallyPoint(path,endpointA);

// set unit on path
world.start();
