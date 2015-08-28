/// <reference path="../typings/tsd.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var uuid = require("node-uuid");
var _ = require("lodash");
var BattleField;
(function (BattleField) {
    var Action = (function () {
        function Action(unit, delay, willRepeat) {
            this.hasRun = false;
            this.unit = unit;
            this.delay = delay;
            this.delayRemaining = delay;
            this.willRepeat = willRepeat;
        }
        Action.prototype.advanceTime = function (timePassed) {
            this.delayRemaining -= timePassed;
            if (this.checkWillRunAction())
                this.run();
            if (this.delayRemaining < 0 && !this.willRepeat) {
                this.delayRemaining = 0;
            }
            if (this.delayRemaining <= 0 && this.willRepeat) {
                this.delayRemaining = this.delay + this.delayRemaining;
                this.hasRun = false;
            }
        };
        Action.prototype.checkWillRunAction = function () {
            return (this.delayRemaining <= 0);
        };
        Action.prototype.run = function () {
            this.hasRun = true;
        };
        return Action;
    })();
    BattleField.Action = Action;
    var StartMovementAction = (function (_super) {
        __extends(StartMovementAction, _super);
        function StartMovementAction() {
            _super.apply(this, arguments);
        }
        StartMovementAction.prototype.run = function () {
            if (this.unit.projectedPositions.length > 0) {
                this.unit.currentPosition = _.clone(this.unit.projectedPositions[0]);
                this.unit.projectedPositions.splice(0, 1);
                console.log(this.unit.id, "current position:", this.unit.currentPosition);
                console.log("projectedPositions", this.unit.projectedPositions.length);
            }
            _super.prototype.run.call(this);
        };
        return StartMovementAction;
    })(Action);
    BattleField.StartMovementAction = StartMovementAction;
    var StopMovementAction = (function (_super) {
        __extends(StopMovementAction, _super);
        function StopMovementAction() {
            _super.apply(this, arguments);
        }
        StopMovementAction.prototype.run = function () {
            // update projected positions
            // set orientation
            _super.prototype.run.call(this);
        };
        return StopMovementAction;
    })(Action);
    var SetAggroTargetAction = (function (_super) {
        __extends(SetAggroTargetAction, _super);
        function SetAggroTargetAction() {
            _super.apply(this, arguments);
        }
        SetAggroTargetAction.prototype.run = function () {
            this.ability.applyEffects(this.target);
            _super.prototype.run.call(this);
        };
        return SetAggroTargetAction;
    })(Action);
    var CancelAggroTargetAction = (function (_super) {
        __extends(CancelAggroTargetAction, _super);
        function CancelAggroTargetAction() {
            _super.apply(this, arguments);
        }
        return CancelAggroTargetAction;
    })(Action);
    (function (TargetType) {
        TargetType[TargetType["Self"] = 0] = "Self";
        TargetType[TargetType["SingleAlly"] = 1] = "SingleAlly";
        TargetType[TargetType["SingleEnemy"] = 2] = "SingleEnemy";
        TargetType[TargetType["Point"] = 3] = "Point";
        TargetType[TargetType["Area"] = 4] = "Area";
    })(BattleField.TargetType || (BattleField.TargetType = {}));
    var TargetType = BattleField.TargetType;
    (function (EffectType) {
        EffectType[EffectType["Damage"] = 0] = "Damage";
        EffectType[EffectType["Heal"] = 1] = "Heal";
        EffectType[EffectType["Slow"] = 2] = "Slow";
        EffectType[EffectType["Root"] = 3] = "Root";
        EffectType[EffectType["Stun"] = 4] = "Stun";
        EffectType[EffectType["Haste"] = 5] = "Haste";
    })(BattleField.EffectType || (BattleField.EffectType = {}));
    var EffectType = BattleField.EffectType;
    var Ability = (function () {
        function Ability(battleUnit, abilityID, effectsApplied, castingTime, cooldownTime, targetType, targetQualifiers, targetRange, isActive) {
            this.battleUnit = battleUnit;
            this.abilityID = abilityID;
            this.effectsApplied = effectsApplied;
            this.castingTime = castingTime;
            this.cooldownTime = cooldownTime;
            this.targetType = targetType;
            this.targetQualifiers = targetQualifiers;
            this.targetRange = targetRange;
            this.isActive = isActive;
            this.cooldownTime = 0;
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
        Ability.prototype.getPriorityTarget = function () {
            if (!this.isEnabled)
                return [];
            var targetsInRange = [];
            var validTargets = [];
            targetsInRange.forEach(function (battleUnit) {
                // check target type
                // check qualifiers
                // check target alive
                validTargets.push(battleUnit);
            });
            if (validTargets.length == 0)
                return [];
            var priorityTarget = validTargets[0];
            return [priorityTarget];
        };
        Ability.prototype.applyEffects = function (target) {
            this.effectsApplied.forEach(function (effect) {
                target.scheduleEffect(effect);
            });
        };
        return Ability;
    })();
    BattleField.Ability = Ability;
    var BattleUnit = (function () {
        function BattleUnit(world, options) {
            this.attributes = {};
            this.abilities = [];
            this.statuses = [];
            this.isAlive = true;
            this.rallyPoint = null;
            this.currentPath = null;
            this.pendingEffects = [];
            this.pendingActions = [];
            this.id = uuid.v1();
            this.classID = options.classID;
            this.attributes["HP"] = options.HP;
            this.baseMovementSpeed = options.baseMovementSpeed;
            this.world = world;
        }
        BattleUnit.prototype.updateState = function (timePassed) {
            this.checkForActiveTarget(timePassed);
            this.pendingActions.forEach(function (action) {
                action.advanceTime(timePassed);
                if (!action.willRepeat && action.hasRun) {
                    _.without(this.pendingActions, action);
                }
            }, this);
            this.pendingEffects.forEach(function (effect) {
                this.applyEffect(effect);
            });
            if (!this.isAlive)
                this.destroy();
        };
        BattleUnit.prototype.setOrientation = function (point, normalPoint) {
        };
        BattleUnit.prototype.setPathAndRallyPoint = function (path, rallyPoint) {
            this.rallyPoint = rallyPoint;
            this.currentPath = path;
            this.updateProjectedPositions();
        };
        BattleUnit.prototype.updateProjectedPositions = function () {
            // TODO account for movement speed modifiers over terrain
            var tweenPoints = this.currentPath.getTweenPoints(this.baseMovementSpeed, this.world.frameDuration, this.rallyPoint);
            console.log("tweenPoints", tweenPoints);
            _.map(tweenPoints, function (coordinate) {
                return {
                    x: coordinate.x,
                    y: coordinate.y,
                    speed: this.baseMovementSpeed,
                    orientation: 0
                };
            }, this);
            this.projectedPositions = tweenPoints;
        };
        BattleUnit.prototype.checkForActiveTarget = function (timePassed) {
            // on each frame, check for auto targeting for abilities
            var validAbilityActivations = [];
            this.abilities.forEach(function (ability) {
                ability.updateCooldown(timePassed);
                var targets = ability.getPriorityTarget();
                if (targets.length > 0) {
                }
            });
            if (validAbilityActivations.length > 0) {
                var priorityAction = validAbilityActivations[0];
                this.scheduleAction(priorityAction);
            }
        };
        BattleUnit.prototype.getStateDeltas = function () {
        };
        BattleUnit.prototype.applyEffect = function (effect) {
            switch (effect.type) {
                case EffectType.Damage:
                    var HP = this.attributes["HP"];
                    HP -= effect.value;
                    if (HP <= 0) {
                        HP = 0;
                        this.isAlive = false;
                    }
                    break;
                default:
                    break;
            }
        };
        BattleUnit.prototype.destroy = function () {
        };
        BattleUnit.prototype.scheduleEffect = function (effect) {
            this.pendingEffects.push(effect);
        };
        BattleUnit.prototype.scheduleAction = function (action) {
            this.pendingActions.push(action);
        };
        return BattleUnit;
    })();
    BattleField.BattleUnit = BattleUnit;
})(BattleField || (BattleField = {}));
var AggroCalculator = (function () {
    function AggroCalculator() {
    }
    return AggroCalculator;
})();
module.exports = BattleField;
