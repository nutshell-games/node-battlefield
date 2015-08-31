/// <reference path="../typings/tsd.d.ts"/>

import {BattleUnit,UnitCombatState} from "./battleUnit";
import G = require("./geometry");
import _ = require("lodash");

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
  source?:BattleUnit;
}

export enum EffectType {
  Damage, Heal, Slow, Root, Stun, Haste
}

export interface AbilityOptions {
  abilityID:string,
  effectsApplied:Effect[],
  castingTime:number,
  cooldownTime:number,
  targetType:TargetType,
  targetQualifiers:string[],
  targetRange:number,
  isActive:boolean
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
    currentCooldownTime: number = 0;
    effectsApplied: Effect[];

    constructor( battleUnit:BattleUnit, options:AbilityOptions) {
      this.battleUnit = battleUnit;
      this.abilityID = options.abilityID;
      this.effectsApplied = options.effectsApplied;
      this.castingTime = options.castingTime;
      this.cooldownTime = options.cooldownTime;
      this.targetType = options.targetType;
      this.targetQualifiers = options.targetQualifiers;
      this.targetRange = options.targetRange;
      this.isActive = options.isActive;

      //this.cooldownTime = 0;
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

    validateTarget(unit:BattleUnit):boolean {
      // ally or enemy?
      // enemy if target does not have same controller and same team
      if (this.battleUnit.owner != unit.owner && this.battleUnit.controller != unit.controller) {
          return true;
      }
      return false;
    }

    getPriorityTarget():BattleUnit[] {

      // how to check if anything is within vision range of a unit?
      // Since there may be an infinite number of units in the world,
      // it is not efficient to iterate over the entire array of world units.

      // Prioritize units on the same path as active unit
      // check line segments
      // need the active unit's path and segment index
      // get indices of segments furthest from unit,
      // generate list of segment indices with increasing distance from current index
      // since

      if (!this.isEnabled) return [];

      var targetsInRange:BattleUnit[] = []; // get all units in range from World

      // Instead, check the vision area around the unit in terms of
      // smaller zones with increasing distance from unit.
      // Since the units only attack each other along paths,
      // check line segments of path with increasing absolute difference of segment index
      var visionRange = this.battleUnit.visionRange;
      var abilityRange = this.targetRange;
      var areaOrigin = this.battleUnit.currentPosition;

      _.each(this.battleUnit.currentPath.units,function(unit:BattleUnit){

        if (unit==this.battleUnit) return;

        var targetPosition = unit.currentPosition;

        var isInVisionRange:boolean = G.isPointInCircle(targetPosition,areaOrigin,visionRange);
        var isInAbilityRange:boolean = G.isPointInCircle(targetPosition,areaOrigin,abilityRange);

        if (isInVisionRange && isInAbilityRange) {
          console.log("!!!!!! FOUND TARGET FOR ABILITY",unit.id,unit.classID);
          targetsInRange.push(unit);

        } else if (isInVisionRange && !isInAbilityRange) {
          // set movement action towards target unit

        }

      },this);

      var validTargets:BattleUnit[] = [];

      _.each(targetsInRange,function(unit:BattleUnit){
        if (this.validateTarget(unit)) {validTargets.push(unit);}
      },this);

      // targetsInRange.forEach(function(battleUnit:BattleUnit){
      //   // check target type
      //   // check qualifiers
      //   // check target alive
      //
      //   validTargets.push(battleUnit);
      // });

      if (validTargets.length==0) return [];

      // TODO prioritize target
      // sort targets by distance

      var priorityTarget = validTargets[0];

      return [priorityTarget];
    }

    applyEffects( target:BattleUnit ) {
      _.each(this.effectsApplied,function(effect:Effect){
        effect.source = this.battleUnit;
        target.scheduleEffect(effect);
      })
    }
  }
