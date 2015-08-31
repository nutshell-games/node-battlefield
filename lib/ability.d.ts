/// <reference path="../typings/tsd.d.ts" />
import { BattleUnit } from "./battleUnit";
export declare enum TargetType {
    Self = 0,
    SingleAlly = 1,
    SingleEnemy = 2,
    Point = 3,
    Area = 4,
}
export interface Effect {
    effectID: string;
    duration: number;
    type: EffectType;
    value: number;
    source?: BattleUnit;
}
export declare enum EffectType {
    Damage = 0,
    Heal = 1,
    Slow = 2,
    Root = 3,
    Stun = 4,
    Haste = 5,
}
export interface AbilityOptions {
    abilityID: string;
    effectsApplied: Effect[];
    castingTime: number;
    cooldownTime: number;
    targetType: TargetType;
    targetQualifiers: string[];
    targetRange: number;
    isActive: boolean;
}
export declare class Ability {
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
    constructor(battleUnit: BattleUnit, options: AbilityOptions);
    updateCooldown(timePassed: number): void;
    calculateProjectedPositions(): void;
    validateTarget(unit: BattleUnit): boolean;
    getPriorityTarget(): BattleUnit[];
    applyEffects(target: BattleUnit): void;
}
