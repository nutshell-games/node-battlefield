/// <reference path="../typings/tsd.d.ts"/>

import uuid = require("node-uuid");
import _ = require("lodash");
import Player = require("./player");
import Path = require("./pathing");
import World = require("./world");
import G = require("./geometry");

module BattleField {

  export interface Position {
    x: number;
    y: number;
    orientation: number;
    speed: number;
  }

  export class Action {
    // set aggro target
    // remove aggro target
    // start movement
    // stop movement

    unit:BattleUnit;
    delay:number;
    delayRemaining: number;
    willRepeat:boolean;
    hasRun:boolean = false;

    constructor( unit:BattleUnit, delay:number, willRepeat:boolean ) {
      this.unit = unit;
      this.delay = delay;
      this.delayRemaining = delay;
      this.willRepeat = willRepeat;

    }

    advanceTime( timePassed: number ) {
      this.delayRemaining -= timePassed;

      if (this.checkWillRunAction()) this.run();

      if (this.delayRemaining<0 && !this.willRepeat) {
        this.delayRemaining = 0;
      }

      if (this.delayRemaining<=0 && this.willRepeat) {
        this.delayRemaining = this.delay + this.delayRemaining;
        this.hasRun = false;
      }
    }

    checkWillRunAction():boolean {
      return (this.delayRemaining<=0);
    }

    run() {
      this.hasRun = true;
    }
  }

  export class StartMovementAction extends Action {

    run() {
      // update projected positions
      // set orientation
      if (this.unit.projectedPositions.length>0) {
        this.unit.currentPosition = _.clone(this.unit.projectedPositions[0]);
        this.unit.projectedPositions.splice(0,1);
        console.log(this.unit.id,"current position:",this.unit.currentPosition);
        console.log("projectedPositions",this.unit.projectedPositions.length);
      }
      super.run();
    }
  }

  class StopMovementAction extends Action {

    run() {
      // update projected positions
      // set orientation

      super.run();
    }

  }

  class SetAggroTargetAction extends Action {

    target: any;
    ability: Ability;
    // override current movement with movement to target

    // constructor(delayRemaining:number, ability:Ability, target:any) {
    //   this.ability = ability;
    //   this.target = target;
    //
    //   super(delayRemaining,false);
    // }

    run() {
      this.ability.applyEffects(this.target);
      super.run();
    }
  }

  class CancelAggroTargetAction extends Action {

  }


  export enum TargetType {
    Self, SingleAlly, SingleEnemy, Point, Area
  }

  export interface Effect {
    // buffs
    // debuffs
    effectID: string;
    duration: number;
    type: EffectType;
    value: number;
  }

  export enum EffectType {
    Damage, Heal, Slow, Root, Stun, Haste
  }

  export class Ability {

    battleUnit: BattleUnit;
    abilityID: string;
    isEnabled: boolean;
    isActive: boolean; // active abilities need to be scheduled actions
    targetType: TargetType;
    targetQualifiers: string[];
    targetRange: number;
    castingTime: number;
    cooldownTime: number;
    currentCooldownTime: number;
    effectsApplied: Effect[];

    constructor( battleUnit:BattleUnit, abilityID:string, effectsApplied:Effect[], castingTime:number, cooldownTime:number, targetType:TargetType, targetQualifiers:string[], targetRange:number, isActive:boolean) {
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

    updateCooldown( timePassed:number ) {
      if (this.cooldownTime==0) return;
      if (this.currentCooldownTime>0) this.currentCooldownTime-=timePassed;

      if (this.currentCooldownTime>0 && this.isEnabled) {
        this.isEnabled = false;
        return;
      }

      if (this.currentCooldownTime<0) this.currentCooldownTime = 0;
      if (this.currentCooldownTime==0 && !this.isEnabled) {
        this.isEnabled = true;
        return;
      }

    }

    calculateProjectedPositions() {

    }

    getPriorityTarget():BattleUnit[] {

      if (!this.isEnabled) return [];

      var targetsInRange:BattleUnit[] = []; // get all units in range from World
      var validTargets:BattleUnit[] = [];

      targetsInRange.forEach(function(battleUnit:BattleUnit){
        // check target type
        // check qualifiers
        // check target alive

        validTargets.push(battleUnit);
      });

      if (validTargets.length==0) return [];

      // prioritize target
      // sort targets by distance

      var priorityTarget = validTargets[0];

      return [priorityTarget];
    }

    applyEffects( target:BattleUnit ) {
      this.effectsApplied.forEach(function(effect:Effect){
        target.scheduleEffect(effect);
      })
    }
  }

  export interface MovementRating {
    terrainType:string;
    multiplier:number;
  }

  export interface AttributeMap {
    [attributeKey: string]: any;
  }

  export interface BattleUnitOptions {
    classID:string;
    HP:number;
    baseMovementSpeed:number;
  }

  export class BattleUnit {

    world:World;
    id:string;
    owner: Player;
    controller: Player;

    classID: string;
    attributes: AttributeMap = {};
    abilities: Ability[] = [];
    statuses: string[] = []; // (e.g. "flying", "poisoned", "slow")

    baseMovementSpeed:number;
    movementRatings:MovementRating[];

    isAlive: boolean = true;

    visionRange: number;

    hasActiveTarget: boolean;

    rallyPoint: any = null;
    currentPath: Path = null;
    projectedPositions: Position[];
    currentPosition: Position;

    pendingEffects: any[] = [];
    pendingActions: any[] = [];

    constructor(world:World, options:BattleUnitOptions) {
      this.id = uuid.v1();
      this.classID = options.classID;
      this.attributes["HP"] = options.HP;
      this.baseMovementSpeed = options.baseMovementSpeed;

      this.world = world;
    }

    updateState( timePassed:number ) {

      // check for new priority actions and actions to be scheduled
      // currently scheduled actions (i.e. movement, attacking) may be cancelled
      this.checkForActiveTarget(timePassed);

      // deduct time from all scheduled/queued effects/actions
      this.pendingActions.forEach(function(action:Action){
        action.advanceTime(timePassed);

        if (!action.willRepeat && action.hasRun) {
          _.without(this.pendingActions,action);
        }
      },this);

      // commit all pending effects to attributes
      this.pendingEffects.forEach(function(effect:Effect){
        this.applyEffect(effect);
      });

      // run actions that are due

      if (!this.isAlive) this.destroy();
    }

    setOrientation( point:G.Point, normalPoint:G.Point ) {
        // calculate
    }

    setPathAndRallyPoint( path:Path, rallyPoint:G.Point ) {
      this.rallyPoint = rallyPoint;
      this.currentPath = path;

      // get travel path to rally point
      this.updateProjectedPositions();
    }

    updateProjectedPositions() {

      // TODO account for movement speed modifiers over terrain

      var tweenPoints = this.currentPath.getTweenPoints(
        this.baseMovementSpeed,this.world.frameDuration,
        new G.Point(this.currentPosition.x,this.currentPosition.y),
        this.rallyPoint);
      console.log("tweenPoints",tweenPoints);

      // TODO set orientation for Point

      _.map(tweenPoints,function(coordinate:{x:number,y:number}){
        return {
          x:coordinate.x,
          y:coordinate.y,
          speed:this.baseMovementSpeed,
          orientation: 0
        }
      },this);

      this.projectedPositions = tweenPoints;
    }

    checkForActiveTarget( timePassed:number ) {
      // on each frame, check for auto targeting for abilities

      var validAbilityActivations:Action[] = [];

      this.abilities.forEach(function(ability:Ability){

        // deduct cooldown time
        ability.updateCooldown(timePassed);
        var targets:BattleUnit[] = ability.getPriorityTarget();

        if (targets.length>0) {
          //var action = new SetAggroTargetAction(this.castingTime,this,targets[0]);
        }

      });

      if (validAbilityActivations.length>0) {
        // prioritize active ability among blocking actions. active abilities are blocking
        // immediately schedule non-blocking actions. passive actions are non-blocking

        //this.hasActiveTarget = targets.length>0;
        var priorityAction = validAbilityActivations[0];

        this.scheduleAction(priorityAction);
      }
    }




    getStateDeltas():any {
      // return any changes in state to update clients
    }

    applyEffect( effect:Effect ) {

      switch (effect.type) {
        case EffectType.Damage:
        var HP:number = this.attributes["HP"];
        HP -= effect.value;
        if (HP<=0) {
          HP = 0;
          this.isAlive = false;
        }
        break;

        default:
        break;
      }

    }

    destroy() {

    }

    scheduleEffect( effect:Effect ) {
      this.pendingEffects.push(effect);
    }

    scheduleAction( action:Action ) {
      this.pendingActions.push(action);
    }

  }

}

class AggroCalculator {
  // given all the valid targets for a unit's actions, which target/action is prioritized?
  // i.e. which enemy draws aggro?
}

export = BattleField;
