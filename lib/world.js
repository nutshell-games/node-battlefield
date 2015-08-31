/// <reference path="../typings/tsd.d.ts"/>
var _ = require("lodash");
var World = (function () {
    function World(frameDuration) {
        this.currentTime = 0;
        this.units = [];
        this.terrain = [];
        this.entities = [];
        this.frameDuration = frameDuration;
    }
    World.prototype.start = function () {
        this.timeLoop = setInterval(this.advanceFrame.bind(this), this.frameDuration);
    };
    World.prototype.stop = function () {
        clearInterval(this.timeLoop);
    };
    World.prototype.advanceFrame = function () {
        this.currentTime += this.frameDuration;
        console.log("==================");
        console.log("current time:", this.currentTime);
        var unitsToSpawn = [];
        var currentState = this.getCurrentState(this.currentTime);
    };
    World.prototype.spawnUnit = function (unit, location) {
        unit.currentPosition = {
            x: location.x, y: location.y, orientation: null, speed: unit.baseMovementSpeed
        };
        this.units.push(unit);
    };
    World.prototype.getCurrentState = function (currentTime) {
        var currentState = {
            units: [], terrain: [], entities: []
        };
        _.each(this.units, function (unit) {
            unit.updateState(this.frameDuration);
            currentState.units.push(unit);
        }, this);
        return currentState;
    };
    World.prototype.broadcast = function () {
    };
    return World;
})();
module.exports = World;
