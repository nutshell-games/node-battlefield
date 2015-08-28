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
        private LUT;
        constructor(endpointA: Point, controlPoint: Point, endpointB: Point);
        flatten(averageUnitsPerSegment: number): any[];
    }
    class Segment {
        a: Point;
        b: Point;
        length: number;
        constructor(endpointA: Point, endpointB: Point);
    }
}
export = Geometry;
