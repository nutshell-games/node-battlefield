/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../lib/tsd.d.ts" />
var BF = require("./battleUnit");
var World = require("./world");
var G = require("./geometry");
var Path = require("./pathing");
var frameDuration = 1000;
var world = new World(frameDuration);
var unit = new BF.BattleUnit(world, {
    classID: "elf", HP: 100, baseMovementSpeed: 10
});
console.log(unit.attributes["HP"]);
var endpointA = new G.Point(150, 40), endpointB = new G.Point(105, 150), controlPoint = new G.Point(80, 30);
var curve = new G.BezierCurve(endpointA, controlPoint, endpointB);
var segments = curve.flatten(5);
var path = new Path(endpointA, endpointB, segments);
console.log("path Length", path.length);
console.log("path segments", path.segments.length);
world.spawnUnit(unit, endpointA);
console.log(world.units);
unit.setPathAndRallyPoint(path, endpointA);
world.start();
