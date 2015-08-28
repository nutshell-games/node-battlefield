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
var unit2:BF.BattleUnit = new BF.BattleUnit(world, {
  classID:"elf",HP:100,baseMovementSpeed:10
});

console.log(unit.attributes["HP"]);

// BUILD MAP

// DEFINE PATHS

var endpointA = new G.Point(100,200), endpointB = new G.Point(200,100), controlPoint = new G.Point(80,30);

var curve = new G.BezierCurve(endpointA,controlPoint,endpointB);

var segments = curve.flatten(5);
var path = new Path(endpointA,endpointB,segments,curve);

console.log("path Length",path.length);
console.log("path segments", path.segments.length);

curve.reverseCompute(curve.LUT[10]);
curve.reverseCompute(curve.LUT[15]);
curve.reverseCompute(curve.LUT[20]);
curve.reverseCompute(curve.LUT[25]);
curve.reverseCompute(curve.LUT[30]);
curve.reverseCompute(curve.LUT[35]);


console.log("--------");
// SPAWN UNITS TO WORLD

world.spawnUnit(unit,endpointA);
world.spawnUnit(unit2,endpointB);
console.log(world.units);

unit.setPathAndRallyPoint(path,endpointB);
unit2.setPathAndRallyPoint(path,endpointA);

// set unit on path
//world.start();
