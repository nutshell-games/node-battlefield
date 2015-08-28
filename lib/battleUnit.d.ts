/// <reference path="../typings/tsd.d.ts" />
import Player = require("./player");
import Path = require("./pathing");
import World = require("./world");
import G = require("./geometry");
declare module BattleField {
    interface Position {
        x: number;
        y: number;
        orientation: number;
        speed: number;
    }
    class Action {
        unit: BattleUnit;
        delay: number;
        delayRemaining: number;
        willRepeat: boolean;
        hasRun: boolean;
        constructor(unit: BattleUnit, delay: number, willRepeat: boolean);
        advanceTime(timePassed: number): void;
        checkWillRunAction(): boolean;
        run(): void;
    }
    class StartMovementAction extends Action {
        run(): void;
    }
    enum TargetType {
        Self = 0,
        SingleAlly = 1,
        SingleEnemy = 2,
        Point = 3,
        Area = 4,
    }
    interface Effect {
        effectID: string;
        duration: number;
        type: EffectType;
        value: number;
    }
    enum EffectType {
        Damage = 0,
        Heal = 1,
        Slow = 2,
        Root = 3,
        Stun = 4,
        Haste = 5,
    }
    class Ability {
        battleUnit: BattleUnit;
        abilityID: string;
        isEnabled: boolean;
        isActive: boolean;
        targetType: TargetType;
        targetQualifiers: string[];
        targetRange: number;
        castingTime: number;
        cooldownTime: number;
        currentCooldownTime: number;
        effectsApplied: Effect[];
        constructor(battleUnit: BattleUnit, abilityID: string, effectsApplied: Effect[], castingTime: number, cooldownTime: number, targetType: TargetType, targetQualifiers: string[], targetRange: number, isActive: boolean);
        updateCooldown(timePassed: number): void;
        calculateProjectedPositions(): void;
        getPriorityTarget(): BattleUnit[];
        applyEffects(target: BattleUnit): void;
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
    }
    class BattleUnit {
        world: World;
        id: string;
        owner: Player;
        controller: Player;
        classID: string;
        attributes: AttributeMap;
        abilities: Ability[];
        statuses: string[];
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
        updateState(timePassed: number): void;
        setOrientation(point: G.Point, normalPoint: G.Point): void;
        setPathAndRallyPoint(path: Path, rallyPoint: G.Point): void;
        updateProjectedPositions(): void;
        checkForActiveTarget(timePassed: number): void;
        getStateDeltas(): any;
        applyEffect(effect: Effect): void;
        destroy(): void;
        scheduleEffect(effect: Effect): void;
        scheduleAction(action: Action): void;
    }
}
export = BattleField;
