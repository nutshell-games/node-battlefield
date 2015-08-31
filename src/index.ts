/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../lib/tsd.d.ts" />

import BF = require("./battleUnit");
import World = require("./world");
import G = require("./geometry");
import Path = require("./pathing");
import {Player} from './player';
import {Ability,TargetType,EffectType,AbilityOptions} from "./ability";

import _ = require("lodash");

const frameDuration = 500;

var player:Player = new Player({
  username: "mike",
  userID:"1234",
  teamID:"abcd",
  lifeTotal:100
});

var player2:Player = new Player({
  username: "george",
  userID:"5678",
  teamID:"efgh",
  lifeTotal:100
});

var world =  new World(frameDuration);

var unit:BF.BattleUnit = new BF.BattleUnit(world, {
  classID:"cyborg",HP:100,baseMovementSpeed:10,visionRange:20
});
var unit2:BF.BattleUnit = new BF.BattleUnit(world, {
  classID:"elf",HP:100,baseMovementSpeed:10,visionRange:20
});

player.fieldUnit(unit);
player2.fieldUnit(unit2);

var axeDamageEffect = {
  effectID:"dmg",
  duration: 0,
  type: EffectType.Damage,
  value: 25
};

var axeAbilityOptions = {
  abilityID:"axe",
  effectsApplied:[axeDamageEffect],
  castingTime:1500,cooldownTime:1000,
  targetType:TargetType.SingleEnemy,
  targetQualifiers:["ground"],targetRange:20,isActive:true
};

var meleeAbility = new Ability(unit,axeAbilityOptions);
//var meleeAbility2 = new Ability(unit2,axeAbilityOptions);

unit.addAbility(meleeAbility);
//unit2.addAbility(meleeAbility2);

// BUILD MAP

// DEFINE PATHS

var endpointA = new G.Point(100,200), endpointB = new G.Point(200,100), controlPoint = new G.Point(80,30);

var curve = new G.BezierCurve(endpointA,controlPoint,endpointB);

var segments = curve.flatten(5);
var path = new Path(endpointA,endpointB,segments,curve);

console.log("path Length",path.length);
console.log("path segments", path.segments.length);

// SPAWN UNITS TO WORLD

world.spawnUnit(unit,endpointA);
world.spawnUnit(unit2,endpointB);
console.log(world.units);

unit.setPathAndRallyPoint(path,endpointB);
unit2.setPathAndRallyPoint(path,endpointA);

// set unit on path
world.start();
