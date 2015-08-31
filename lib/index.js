/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../lib/tsd.d.ts" />
var BF = require("./battleUnit");
var World = require("./world");
var G = require("./geometry");
var Path = require("./pathing");
var player_1 = require('./player');
var ability_1 = require("./ability");
var frameDuration = 500;
var player = new player_1.Player({
    username: "mike",
    userID: "1234",
    teamID: "abcd",
    lifeTotal: 100
});
var player2 = new player_1.Player({
    username: "george",
    userID: "5678",
    teamID: "efgh",
    lifeTotal: 100
});
var world = new World(frameDuration);
var unit = new BF.BattleUnit(world, {
    classID: "cyborg", HP: 100, baseMovementSpeed: 10, visionRange: 20
});
var unit2 = new BF.BattleUnit(world, {
    classID: "elf", HP: 100, baseMovementSpeed: 10, visionRange: 20
});
player.fieldUnit(unit);
player2.fieldUnit(unit2);
var axeDamageEffect = {
    effectID: "dmg",
    duration: 0,
    type: ability_1.EffectType.Damage,
    value: 25
};
var axeAbilityOptions = {
    abilityID: "axe",
    effectsApplied: [axeDamageEffect],
    castingTime: 1500, cooldownTime: 1000,
    targetType: ability_1.TargetType.SingleEnemy,
    targetQualifiers: ["ground"], targetRange: 20, isActive: true
};
var meleeAbility = new ability_1.Ability(unit, axeAbilityOptions);
unit.addAbility(meleeAbility);
var endpointA = new G.Point(100, 200), endpointB = new G.Point(200, 100), controlPoint = new G.Point(80, 30);
var curve = new G.BezierCurve(endpointA, controlPoint, endpointB);
var segments = curve.flatten(5);
var path = new Path(endpointA, endpointB, segments, curve);
console.log("path Length", path.length);
console.log("path segments", path.segments.length);
world.spawnUnit(unit, endpointA);
world.spawnUnit(unit2, endpointB);
console.log(world.units);
unit.setPathAndRallyPoint(path, endpointB);
unit2.setPathAndRallyPoint(path, endpointA);
world.start();
