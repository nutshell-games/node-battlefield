/// <reference path="../typings/tsd.d.ts" />
import G = require("./geometry");
declare class Path {
    endpointA: G.Point;
    endpointB: G.Point;
    segments: G.Segment[];
    length: number;
    map: any;
    bezier: G.BezierCurve;
    constructor(endpointA: G.Point, endpointB: G.Point, segments: G.Segment[], bezier: G.BezierCurve);
    calculateLength(): number;
    getTweenPoints(speed: number, tweenInterval: number, originPoint: G.Point, destinationPoint: G.Point): any;
    getPointAtDistanceAlongSegment(distance: number, segmentIndex: number, originEndpoint: G.Point): G.Point;
}
export = Path;
