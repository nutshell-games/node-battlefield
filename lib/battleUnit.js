/// <reference path="../typings/tsd.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var uuid = require("node-uuid");
var _ = require("lodash");
var ability_1 = require("./ability");
var G = require("./geometry");
var BattleField;
(function (BattleField) {
    (function (ActionType) {
        ActionType[ActionType["AnyAction"] = 0] = "AnyAction";
        ActionType[ActionType["MovementAction"] = 1] = "MovementAction";
        ActionType[ActionType["ActiveAction"] = 2] = "ActiveAction";
        ActionType[ActionType["PassiveAction"] = 3] = "PassiveAction";
    })(BattleField.ActionType || (BattleField.ActionType = {}));
    var ActionType = BattleField.ActionType;
    var Action = (function () {
        function Action(unit, delay, willRepeat, type, actionKey) {
            this.isEnabled = true;
            this.hasRun = false;
            this.actionKey = null;
            this.unit = unit;
            this.delay = delay;
            this.delayRemaining = delay;
            this.willRepeat = willRepeat;
            this.type = type || ActionType.AnyAction;
            this.actionKey = actionKey || null;
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
        Action.prototype.disable = function () {
            if (this.isEnabled) {
                this.isEnabled = false;
                this.delayRemaining = this.delay;
            }
        };
        Action.prototype.enable = function () {
            this.isEnabled = true;
        };
        Action.prototype.checkWillRunAction = function () {
            return (this.delayRemaining <= 0 && this.isEnabled);
        };
        Action.prototype.run = function () {
            this.hasRun = true;
        };
        return Action;
    })();
    BattleField.Action = Action;
    var StartMovementAction = (function (_super) {
        __extends(StartMovementAction, _super);
        function StartMovementAction(unit, delay, willRepeat) {
            _super.call(this, unit, delay, willRepeat, ActionType.MovementAction);
        }
        StartMovementAction.prototype.run = function () {
            if (this.unit.projectedPositions.length > 0) {
                this.unit.currentPosition = _.clone(this.unit.projectedPositions[0]);
                this.unit.projectedPositions.splice(0, 1);
                console.log("unit advanced position");
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
    var SetAbilityAction = (function (_super) {
        __extends(SetAbilityAction, _super);
        function SetAbilityAction(ability, target) {
            this.ability = ability;
            this.target = target;
            _super.call(this, ability.battleUnit, ability.castingTime, false, ActionType.ActiveAction, ability.abilityID);
        }
        SetAbilityAction.prototype.run = function () {
            this.ability.applyEffects(this.target);
            if (this.type == ActionType.ActiveAction) {
                this.unit.currentAction = null;
            }
            _super.prototype.run.call(this);
        };
        return SetAbilityAction;
    })(Action);
    var CancelAbilityAction = (function (_super) {
        __extends(CancelAbilityAction, _super);
        function CancelAbilityAction() {
            _super.apply(this, arguments);
        }
        return CancelAbilityAction;
    })(Action);
    (function (UnitCombatState) {
        UnitCombatState[UnitCombatState["StationaryNeutral"] = 0] = "StationaryNeutral";
        UnitCombatState[UnitCombatState["MovingNeutral"] = 1] = "MovingNeutral";
        UnitCombatState[UnitCombatState["MovingAggro"] = 2] = "MovingAggro";
        UnitCombatState[UnitCombatState["MovingAlly"] = 3] = "MovingAlly";
        UnitCombatState[UnitCombatState["StationaryAggro"] = 4] = "StationaryAggro";
        UnitCombatState[UnitCombatState["StationaryAlly"] = 5] = "StationaryAlly";
    })(BattleField.UnitCombatState || (BattleField.UnitCombatState = {}));
    var UnitCombatState = BattleField.UnitCombatState;
    var BattleUnit = (function () {
        function BattleUnit(world, options) {
            this.activeTarget = null;
            this.activeAbility = null;
            this.currentAction = null;
            this.movementAction = null;
            this.attributes = {};
            this.abilities = [];
            this.statuses = [];
            this.combatState = UnitCombatState.StationaryNeutral;
            this.isAlive = true;
            this.rallyPoint = null;
            this.currentPath = null;
            this.pendingEffects = [];
            this.pendingActions = [];
            this.id = uuid.v1();
            this.classID = options.classID;
            this.attributes["HP"] = options.HP;
            this.baseMovementSpeed = options.baseMovementSpeed;
            this.visionRange = options.visionRange;
            this.world = world;
        }
        BattleUnit.prototype.addAbility = function (ability) {
            if (!_.includes(this.abilities, ability)) {
                this.abilities.push(ability);
            }
        };
        BattleUnit.prototype.updateState = function (timePassed) {
            if (!this.isAlive) {
                this.destroy();
                return;
            }
            console.log("unit state", this.id, "-----------------");
            console.log("pre-action pending effects:", this.pendingEffects.length);
            _.each(this.pendingEffects, function (effect) {
                this.applyEffect(effect);
            }, this);
            console.log("current position:", this.currentPosition);
            console.log("projectedPositions", this.projectedPositions.length);
            this.checkForActiveTarget(timePassed);
            console.log("pending actions:", this.pendingActions.length);
            this.pendingActions.forEach(function (action) {
                action.advanceTime(timePassed);
                if (!action.willRepeat && action.hasRun) {
                    this.pendingActions = _.without(this.pendingActions, action);
                }
            }, this);
            console.log("post-action pending effects:", this.pendingEffects.length);
            _.each(this.pendingEffects, function (effect) {
                this.applyEffect(effect);
            }, this);
            if (!this.isAlive) {
                this.destroy();
                return;
            }
        };
        BattleUnit.prototype.setOrientation = function (point, normalPoint) {
        };
        BattleUnit.prototype.setPathAndRallyPoint = function (path, rallyPoint) {
            this.rallyPoint = rallyPoint;
            this.combatState = UnitCombatState.MovingNeutral;
            if (path !== this.currentPath && this.currentPath !== null) {
                this.currentPath.removeUnit(this);
            }
            this.currentPath = path;
            this.currentPath.addUnit(this);
            this.updateProjectedPositions();
            var movementAction = new StartMovementAction(this, this.world.frameDuration, true);
            this.movementAction = movementAction;
            this.scheduleAction(movementAction);
        };
        BattleUnit.prototype.updateProjectedPositions = function () {
            // TODO account for movement speed modifiers over terrain
            var tweenPoints = this.currentPath.getTweenPoints(this.baseMovementSpeed, this.world.frameDuration, new G.Point(this.currentPosition.x, this.currentPosition.y), this.rallyPoint);
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
            if (this.activeTarget !== null && this.activeAbility !== null) {
            }
            this.abilities.forEach(function (ability) {
                //console.log("check ability",ability);
                ability.updateCooldown(timePassed);
                var targets = ability.getPriorityTarget();
                console.log("valid targets", targets.length);
                if (targets.length > 0) {
                    var action = new SetAbilityAction(ability, targets[0]);
                    validAbilityActivations.push(action);
                }
            });
            if (validAbilityActivations.length == 0) {
                if (this.movementAction !== null) {
                    this.movementAction.enable();
                }
                return false;
            }
            var priorityAction = validAbilityActivations[0];
            console.log("priorityAction", priorityAction.type);
            if (this.currentAction == null) {
                if (priorityAction.type == ActionType.ActiveAction) {
                    console.log("STOPPING MOVEMENT OF ATTACKER.");
                    this.movementAction.disable();
                    this.currentAction = priorityAction;
                }
                this.scheduleAction(priorityAction);
                console.log("ATTACK SCHEDULED.");
                return true;
            }
            else {
                if (priorityAction.type == this.currentAction.type && priorityAction.actionKey == this.currentAction.actionKey) {
                    console.log("ATTACK ALREADY SCHEDULED.");
                    return false;
                }
            }
        };
        BattleUnit.prototype.disableMovement = function () {
            if (this.movementAction !== null) {
                this.movementAction.isEnabled = false;
            }
        };
        BattleUnit.prototype.stopMovemement = function () {
            console.log("stopping movement", this.id);
            if (this.movementAction !== null) {
                console.log("cancelling action...");
                this.cancelAction(this.movementAction);
            }
        };
        BattleUnit.prototype.getStateDeltas = function () {
        };
        BattleUnit.prototype.applyEffect = function (effect) {
            switch (effect.type) {
                case ability_1.EffectType.Damage:
                    this.attributes["HP"] -= effect.value;
                    console.log(">>>>>>> UNIT DAMAGED", "current HP:", this.attributes["HP"]);
                    if (this.attributes["HP"] <= 0) {
                        this.attributes["HP"] = 0;
                        this.isAlive = false;
                    }
                    else {
                        console.log("UNIT STOPPED after damage");
                        if (this.movementAction !== null) {
                            this.cancelAction(this.movementAction);
                        }
                    }
                    break;
                default:
                    break;
            }
            this.pendingEffects = _.without(this.pendingEffects, effect);
        };
        BattleUnit.prototype.destroy = function () {
            this.currentPath.removeUnit(this);
        };
        BattleUnit.prototype.scheduleEffect = function (effect) {
            this.pendingEffects.push(effect);
        };
        BattleUnit.prototype.scheduleAction = function (action) {
            this.pendingActions.push(action);
        };
        BattleUnit.prototype.cancelAction = function (action) {
            if (_.contains(this.pendingActions, action)) {
                this.pendingActions = _.without(this.pendingActions, action);
                console.log("action cancelled");
                return true;
            }
            else {
                return false;
            }
        };
        return BattleUnit;
    })();
    BattleField.BattleUnit = BattleUnit;
    var AggroCalculator = (function () {
        function AggroCalculator(unit) {
            this.unit = unit;
        }
        return AggroCalculator;
    })();
})(BattleField || (BattleField = {}));
module.exports = BattleField;
