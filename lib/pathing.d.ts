/// <reference path="../typings/tsd.d.ts" />
import G = require("./geometry");
import { BattleUnit } from "./battleUnit";
import { Checkpoint } from "./checkpoint";
declare class Path {
    endpointA: G.Point;
    endpointB: G.Point;
    segments: G.Segment[];
    length: number;
    map: any;
    bezier: G.BezierCurve;
    units: BattleUnit[];
    checkpoints: Checkpoint[];
    constructor(endpointA: G.Point, endpointB: G.Point, segments: G.Segment[], bezier: G.BezierCurve);
    calculateLength(): number;
    getTweenPoints(speed: number, tweenInterval: number, originPoint: G.Point, destinationPoint: G.Point): any;
    removeUnit(unit: BattleUnit): void;
    addUnit(unit: BattleUnit): void;
    addCheckpoint(checkpoint: Checkpoint): void;
}
export = Path;
