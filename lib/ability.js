/// <reference path="../typings/tsd.d.ts"/>
var G = require("./geometry");
var _ = require("lodash");
(function (TargetType) {
    TargetType[TargetType["Self"] = 0] = "Self";
    TargetType[TargetType["SingleAlly"] = 1] = "SingleAlly";
    TargetType[TargetType["SingleEnemy"] = 2] = "SingleEnemy";
    TargetType[TargetType["Point"] = 3] = "Point";
    TargetType[TargetType["Area"] = 4] = "Area";
})(exports.TargetType || (exports.TargetType = {}));
var TargetType = exports.TargetType;
(function (EffectType) {
    EffectType[EffectType["Damage"] = 0] = "Damage";
    EffectType[EffectType["Heal"] = 1] = "Heal";
    EffectType[EffectType["Slow"] = 2] = "Slow";
    EffectType[EffectType["Root"] = 3] = "Root";
    EffectType[EffectType["Stun"] = 4] = "Stun";
    EffectType[EffectType["Haste"] = 5] = "Haste";
})(exports.EffectType || (exports.EffectType = {}));
var EffectType = exports.EffectType;
var Ability = (function () {
    function Ability(battleUnit, options) {
        this.currentCooldownTime = 0;
        this.battleUnit = battleUnit;
        this.abilityID = options.abilityID;
        this.effectsApplied = options.effectsApplied;
        this.castingTime = options.castingTime;
        this.cooldownTime = options.cooldownTime;
        this.targetType = options.targetType;
        this.targetQualifiers = options.targetQualifiers;
        this.targetRange = options.targetRange;
        this.isActive = options.isActive;
        this.isEnabled = true;
    }
    Ability.prototype.updateCooldown = function (timePassed) {
        if (this.cooldownTime == 0)
            return;
        if (this.currentCooldownTime > 0)
            this.currentCooldownTime -= timePassed;
        if (this.currentCooldownTime > 0 && this.isEnabled) {
            this.isEnabled = false;
            return;
        }
        if (this.currentCooldownTime < 0)
            this.currentCooldownTime = 0;
        if (this.currentCooldownTime == 0 && !this.isEnabled) {
            this.isEnabled = true;
            return;
        }
    };
    Ability.prototype.calculateProjectedPositions = function () {
    };
    Ability.prototype.validateTarget = function (unit) {
        if (this.battleUnit.owner != unit.owner && this.battleUnit.controller != unit.controller) {
            return true;
        }
        return false;
    };
    Ability.prototype.getPriorityTarget = function () {
        // how to check if anything is within vision range of a unit?
        // Since there may be an infinite number of units in the world,
        // it is not efficient to iterate over the entire array of world units.
        if (!this.isEnabled)
            return [];
        var targetsInRange = [];
        var visionRange = this.battleUnit.visionRange;
        var abilityRange = this.targetRange;
        var areaOrigin = this.battleUnit.currentPosition;
        _.each(this.battleUnit.currentPath.units, function (unit) {
            if (unit == this.battleUnit)
                return;
            var targetPosition = unit.currentPosition;
            var isInVisionRange = G.isPointInCircle(targetPosition, areaOrigin, visionRange);
            var isInAbilityRange = G.isPointInCircle(targetPosition, areaOrigin, abilityRange);
            if (isInVisionRange && isInAbilityRange) {
                console.log("!!!!!! FOUND TARGET FOR ABILITY", unit.id, unit.classID);
                targetsInRange.push(unit);
            }
            else if (isInVisionRange && !isInAbilityRange) {
            }
        }, this);
        var validTargets = [];
        _.each(targetsInRange, function (unit) {
            if (this.validateTarget(unit)) {
                validTargets.push(unit);
            }
        }, this);
        if (validTargets.length == 0)
            return [];
        var priorityTarget = validTargets[0];
        return [priorityTarget];
    };
    Ability.prototype.applyEffects = function (target) {
        _.each(this.effectsApplied, function (effect) {
            effect.source = this.battleUnit;
            target.scheduleEffect(effect);
        });
    };
    return Ability;
})();
exports.Ability = Ability;
