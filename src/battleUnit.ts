/// <reference path="../typings/tsd.d.ts"/>


import uuid = require("node-uuid");
import _ = require("lodash");
//import Player = require("./player");
import {Ability,Effect,EffectType} from "./ability";
import {Player,PlayerOptions} from "./player";
import Path = require("./pathing");
import World = require("./world");
import G = require("./geometry");

module BattleField {

  export interface Position {
    x: number;
    y: number;
    orientation: number;
    speed: number;
    segmentIndex?:number;
  }

  export enum ActionType {
    AnyAction, MovementAction, ActiveAction, PassiveAction
  }

  export class Action {
    // set aggro target
    // remove aggro target
    // start movement
    // stop movement

    isEnabled:boolean = true;
    unit:BattleUnit;
    delay:number;
    delayRemaining: number;
    willRepeat:boolean;
    hasRun:boolean = false;
    type:ActionType;
    actionKey:string = null; // the abilityID of an Active action

    constructor( unit:BattleUnit, delay:number, willRepeat:boolean, type?:ActionType, actionKey?:string ) {
      this.unit = unit;
      this.delay = delay;
      this.delayRemaining = delay;
      this.willRepeat = willRepeat;
      this.type = type || ActionType.AnyAction;
      this.actionKey = actionKey || null;
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

    disable() {
      if (this.isEnabled) {
        this.isEnabled = false;
        this.delayRemaining = this.delay;
      }
    }

    enable() {
      this.isEnabled = true;
    }

    checkWillRunAction():boolean {
      return (this.delayRemaining<=0 && this.isEnabled);
    }

    run() {
      this.hasRun = true;
    }
  }

  export class StartMovementAction extends Action {

    constructor( unit:BattleUnit, delay:number, willRepeat:boolean) {

      super(unit,delay,willRepeat,ActionType.MovementAction);
    }

    run() {
      // update projected positions
      // set orientation
      if (this.unit.projectedPositions.length>0) {
        this.unit.currentPosition = _.clone(this.unit.projectedPositions[0]);
        this.unit.projectedPositions.splice(0,1);
        console.log("unit advanced position");
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

  class SetAbilityAction extends Action {


    target: any;
    ability: Ability;
    // override current movement with movement to target

    constructor(ability:Ability, target:any) {
      this.ability = ability;
      this.target = target;

      super(ability.battleUnit, ability.castingTime, false, ActionType.ActiveAction, ability.abilityID);
    }

    run() {
      this.ability.applyEffects(this.target);

      // unblock active ability for action scheduling
      if (this.type==ActionType.ActiveAction) {
        this.unit.currentAction = null;
      }

      super.run();
    }
  }

  class CancelAbilityAction extends Action {

  }

  // Ability

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
    visionRange:number;
  }

  export enum UnitCombatState {
    StationaryNeutral, MovingNeutral,
    MovingAggro, MovingAlly,
    StationaryAggro, StationaryAlly
  }

  export class BattleUnit {

    world:World;
    id:string;
    owner: Player;
    controller: Player;

    activeTarget:BattleUnit = null;
    activeAbility:Ability = null;
    currentAction:Action = null;
    movementAction:StartMovementAction = null;

    classID: string;
    attributes: AttributeMap = {};
    abilities: Ability[] = [];
    statuses: string[] = []; // (e.g. "flying", "poisoned", "slow")
    combatState:UnitCombatState = UnitCombatState.StationaryNeutral;

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
      this.visionRange = options.visionRange;

      this.world = world;
    }

    addAbility(ability:Ability) {
      if (!_.includes(this.abilities,ability)) {
        this.abilities.push(ability);
      }
    }

    updateState( timePassed:number ) {

      if (!this.isAlive) {
        this.destroy();
        return;
      }

      console.log("unit state",this.id,"-----------------");
      console.log("pre-action pending effects:",this.pendingEffects.length);

      // commit all pending effects to attributes
      _.each(this.pendingEffects,function(effect:Effect){
        this.applyEffect(effect);
      },this);


      console.log("current position:",this.currentPosition);
      console.log("projectedPositions",this.projectedPositions.length);

      // check for new priority actions and actions to be scheduled
      // currently scheduled actions (i.e. movement, attacking) may be cancelled
      this.checkForActiveTarget(timePassed);

      console.log("pending actions:",this.pendingActions.length);


      // deduct time from all scheduled/queued effects/actions
      this.pendingActions.forEach(function(action:Action){

        // run actions that are due
        action.advanceTime(timePassed);

        if (!action.willRepeat && action.hasRun) {
         this.pendingActions = _.without(this.pendingActions,action);
        }
      },this);

      console.log("post-action pending effects:",this.pendingEffects.length);

      // commit all pending effects to attributes
      _.each(this.pendingEffects,function(effect:Effect){
        this.applyEffect(effect);
      },this);

      
      if (!this.isAlive) {
        this.destroy();
        return;
      }

    }

    setOrientation( point:G.Point, normalPoint:G.Point ) {
        // calculate
    }

    setPathAndRallyPoint( path:Path, rallyPoint:G.Point ) {
      this.rallyPoint = rallyPoint;
      this.combatState = UnitCombatState.MovingNeutral;

      // if current path does not = new path
      // remove unit from current path
      // add unit to new path
      if (path!==this.currentPath && this.currentPath!==null) {
        this.currentPath.removeUnit(this);
      }
      this.currentPath = path;
      this.currentPath.addUnit(this);

      // get travel path to rally point
      this.updateProjectedPositions();

      // TODO when to schedule movement action?
      var movementAction:StartMovementAction = new StartMovementAction(this,this.world.frameDuration,true);
      this.movementAction = movementAction;
      this.scheduleAction(movementAction);
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

      if (this.activeTarget!==null && this.activeAbility!==null) {

      }

      this.abilities.forEach(function(ability:Ability){
        //console.log("check ability",ability);

        // deduct cooldown time
        ability.updateCooldown(timePassed);
        var targets:BattleUnit[] = ability.getPriorityTarget();
        console.log("valid targets",targets.length);

        if (targets.length>0) {
          var action = new SetAbilityAction(ability,targets[0]);
          validAbilityActivations.push(action);
        }

      });

      // if no active actions to perform,
      // resume pasued movement toward rally point
      if (validAbilityActivations.length==0) {
        if (this.movementAction!==null) {
          this.movementAction.enable();
        }
        return false;
      }


        // TODO prioritize active ability among blocking actions. active abilities are blocking
        // immediately schedule non-blocking actions. passive actions are non-blocking

        var priorityAction = validAbilityActivations[0];
        console.log("priorityAction",priorityAction.type);

        if (this.currentAction==null) {
          // pause unit movement, while attacking
          if (priorityAction.type==ActionType.ActiveAction) {
            console.log("STOPPING MOVEMENT OF ATTACKER.");
            //this.stopMovemement();
            this.movementAction.disable();
            this.currentAction = priorityAction;
          }

          // TODO update combat state
          // this.battleUnit.combatState = UnitCombatState.StationaryAggro;
          //this.battleUnit.combatState = UnitCombatState.MovingAggro;
          // TODO set rally point to target unit


          this.scheduleAction(priorityAction);
          console.log("ATTACK SCHEDULED.");

          return true;

        } else {
          // if priority action matches unit's current blobking/active action
          // the priority action has already been scheduled
          if (priorityAction.type==this.currentAction.type && priorityAction.actionKey==this.currentAction.actionKey) {
              console.log("ATTACK ALREADY SCHEDULED.");
              return false;
          }

        }

    }

    disableMovement() {
      if (this.movementAction!==null) {
        this.movementAction.isEnabled = false;
      }
    }

    stopMovemement() {
      console.log("stopping movement",this.id);
      // only pause movement while unit is attacking
      // resume movement after target is destroyed || removed

      if (this.movementAction!==null) {
        console.log("cancelling action...")
        this.cancelAction(this.movementAction);
      }
    }


    getStateDeltas():any {
      // return any changes in state to update clients
    }

    applyEffect( effect:Effect ) {

      switch (effect.type) {
        case EffectType.Damage:

        this.attributes["HP"] -= effect.value;
        console.log(">>>>>>> UNIT DAMAGED","current HP:",this.attributes["HP"]);
        if (this.attributes["HP"]<=0) {
          this.attributes["HP"] = 0;
          this.isAlive = false;
        } else {
          // if unit survived
          // source of damage will draw aggro
          // stop unit, cancel movement
          console.log("UNIT STOPPED after damage");
          if (this.movementAction!==null) {
            this.cancelAction(this.movementAction);
          }
        }
        break;

        default:
        break;
      }

      this.pendingEffects = _.without(this.pendingEffects,effect);
    }

    destroy() {
      // remove from path
      this.currentPath.removeUnit(this);

      // cancel all actions
    }

    scheduleEffect( effect:Effect ) {
      this.pendingEffects.push(effect);
    }

    scheduleAction( action:Action ) {
      this.pendingActions.push(action);
    }

    cancelAction( action:Action ) {
      if (_.contains(this.pendingActions,action)) {
        this.pendingActions = _.without(this.pendingActions,action);
        console.log("action cancelled");
        return true;
      } else {
        return false;
      }
    }

  }

  class AggroCalculator {

    unit:BattleUnit;
    // given all the valid targets for a unit's actions, which target/action is prioritized?
    // i.e. which enemy draws aggro?


    constructor(unit:BattleUnit) {
      this.unit = unit;
    }




  }

}



export = BattleField;
