/// <reference path="../typings/tsd.d.ts" />
import G = require("./geometry");
declare class Path {
    endpointA: G.Point;
    endpointB: G.Point;
    segments: G.Segment[];
    length: number;
    map: any;
    constructor(endpointA: G.Point, endpointB: G.Point, segments: G.Segment[]);
    private calculateLength();
    getTweenPoints(speed: number, tweenInterval: number, startPoint: G.Point): any;
    getPointAtDistanceAlongSegment(distance: number, segmentIndex: number, originEndpoint: G.Point): G.Point;
}
export = Path;
