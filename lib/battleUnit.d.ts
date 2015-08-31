/// <reference path="../typings/tsd.d.ts" />
import { Ability, Effect } from "./ability";
import { Player } from "./player";
import Path = require("./pathing");
import World = require("./world");
import G = require("./geometry");
declare module BattleField {
    interface Position {
        x: number;
        y: number;
        orientation: number;
        speed: number;
        segmentIndex?: number;
    }
    enum ActionType {
        AnyAction = 0,
        MovementAction = 1,
        ActiveAction = 2,
        PassiveAction = 3,
    }
    class Action {
        isEnabled: boolean;
        unit: BattleUnit;
        delay: number;
        delayRemaining: number;
        willRepeat: boolean;
        hasRun: boolean;
        type: ActionType;
        actionKey: string;
        constructor(unit: BattleUnit, delay: number, willRepeat: boolean, type?: ActionType, actionKey?: string);
        advanceTime(timePassed: number): void;
        disable(): void;
        enable(): void;
        checkWillRunAction(): boolean;
        run(): void;
    }
    class StartMovementAction extends Action {
        constructor(unit: BattleUnit, delay: number, willRepeat: boolean);
        run(): void;
    }
    interface MovementRating {
        terrainType: string;
        multiplier: number;
    }
    interface AttributeMap {
        [attributeKey: string]: any;
    }
    interface BattleUnitOptions {
        classID: string;
        HP: number;
        baseMovementSpeed: number;
        visionRange: number;
    }
    enum UnitCombatState {
        StationaryNeutral = 0,
        MovingNeutral = 1,
        MovingAggro = 2,
        MovingAlly = 3,
        StationaryAggro = 4,
        StationaryAlly = 5,
    }
    class BattleUnit {
        world: World;
        id: string;
        owner: Player;
        controller: Player;
        activeTarget: BattleUnit;
        activeAbility: Ability;
        currentAction: Action;
        movementAction: StartMovementAction;
        classID: string;
        attributes: AttributeMap;
        abilities: Ability[];
        statuses: string[];
        combatState: UnitCombatState;
        baseMovementSpeed: number;
        movementRatings: MovementRating[];
        isAlive: boolean;
        visionRange: number;
        hasActiveTarget: boolean;
        rallyPoint: any;
        currentPath: Path;
        projectedPositions: Position[];
        currentPosition: Position;
        pendingEffects: any[];
        pendingActions: any[];
        constructor(world: World, options: BattleUnitOptions);
        addAbility(ability: Ability): void;
        updateState(timePassed: number): void;
        setOrientation(point: G.Point, normalPoint: G.Point): void;
        setPathAndRallyPoint(path: Path, rallyPoint: G.Point): void;
        updateProjectedPositions(): void;
        checkForActiveTarget(timePassed: number): boolean;
        disableMovement(): void;
        stopMovemement(): void;
        getStateDeltas(): any;
        applyEffect(effect: Effect): void;
        destroy(): void;
        scheduleEffect(effect: Effect): void;
        scheduleAction(action: Action): void;
        cancelAction(action: Action): boolean;
    }
}
export = BattleField;
