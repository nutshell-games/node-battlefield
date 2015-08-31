/// <reference path="../typings/tsd.d.ts" />
declare module Geometry {
    function isPointInCircle(targetPoint: Coordinate, circleOrigin: Coordinate, circleRadius: number): boolean;
    interface Coordinate {
        x: number;
        y: number;
    }
    class Point {
        x: number;
        y: number;
        constructor(x: number, y: number);
        getCoordinate(): number[];
        distanceFromPoint(point: Point): number;
        closestPointAmongPoints(points: Point[]): Point;
    }
    class BezierCurve {
        private curve;
        private arclength;
        LUT: Point[];
        constructor(endpointA: Point, controlPoint: Point, endpointB: Point);
        flatten(averageUnitsPerSegment: number): any[];
        reverseCompute(point: Point): number;
    }
    class Segment {
        a: Point;
        b: Point;
        tValueForA: number;
        tValueForB: number;
        length: number;
        constructor(endpointA: Point, endpointB: Point, tValueForA: number, tValueForB: number);
        getPointAtDistanceAlongSegment(distance: number, referencePointTValue: number): Point;
    }
}
export = Geometry;
