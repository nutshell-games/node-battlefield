/// <reference path="../typings/tsd.d.ts" />
declare module Geometry {
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
    }
}
export = Geometry;
