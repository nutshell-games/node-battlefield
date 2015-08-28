/// <reference path="../typings/tsd.d.ts"/>
var _ = require("lodash");
var Bezier = require("bezier-js");
var QuadraticSolver = require("solve-quadratic-equation");
var Geometry;
(function (Geometry) {
    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        Point.prototype.getCoordinate = function () {
            return [this.x, this.y];
        };
        Point.prototype.distanceFromPoint = function (point) {
            return Math.sqrt(Math.pow((point.x - this.x), 2) + Math.pow((point.y - this.y), 2));
        };
        Point.prototype.closestPointAmongPoints = function (points) {
            var pointsByDistance = _.sortBy(points, function (point) {
                return this.distanceFromPoint(point);
            }, this);
            return pointsByDistance[0];
        };
        return Point;
    })();
    Geometry.Point = Point;
    var BezierCurve = (function () {
        function BezierCurve(endpointA, controlPoint, endpointB) {
            this.LUT = [];
            this.curve = new Bezier(endpointA.x, endpointA.y, controlPoint.x, controlPoint.y, endpointB.x, endpointB.y);
            this.arclength = this.curve.length();
        }
        BezierCurve.prototype.flatten = function (averageUnitsPerSegment) {
            var steps = Math.floor(this.arclength / averageUnitsPerSegment);
            var LUT = this.curve.getLUT(steps);
            var segments = [];
            var totalSegmentLength = 0;
            _.each(LUT, function (point, idx) {
                console.log("LUT", idx, point);
                if (idx < LUT.length - 1) {
                    var pointA = point, pointB = LUT[idx + 1];
                    var tValueForA = this.reverseCompute(pointA), tValueForB = this.reverseCompute(pointB);
                    var segment = new Segment(pointA, pointB, tValueForA, tValueForB);
                    segments.push(segment);
                }
            }, this);
            this.LUT = LUT;
            return segments;
        };
        BezierCurve.prototype.reverseCompute = function (point) {
            var x = point.x, y = point.y, bezier = this.curve;
            var tValue;
            if (x == bezier.points[0].x && y == bezier.points[0].y) {
                return 0;
            }
            if (x == bezier.points[bezier.order].x && y == bezier.points[bezier.order].y) {
                return 1;
            }
            var p = bezier.points;
            if (bezier.order === 2) {
                var a = (p[0].x) + (-2 * p[1].x) + (p[2].x);
                var b = (2 * p[1].x) + (-2 * p[0].x);
                var c = p[0].x - x;
                var roots = QuadraticSolver(a, b, c);
                tValue = roots[1];
            }
            return tValue;
        };
        return BezierCurve;
    })();
    Geometry.BezierCurve = BezierCurve;
    var Segment = (function () {
        function Segment(endpointA, endpointB, tValueForA, tValueForB) {
            this.a = endpointA;
            this.b = endpointB;
            this.tValueForA = tValueForA;
            this.tValueForB = tValueForB;
            this.length = Math.sqrt(Math.pow(this.a.x - this.b.x, 2) + Math.pow(this.a.y - this.b.y, 2));
            console.log("length", this.length);
        }
        Segment.prototype.getPointAtDistanceAlongSegment = function (distance, referencePointTValue) {
            var segment = this;
            var targetOrigin = Math.abs(referencePointTValue - segment.tValueForA) < Math.abs(referencePointTValue - segment.tValueForB) ? segment.a : segment.b;
            var slope = (segment.a.y - segment.b.y) / (segment.a.x - segment.b.x);
            var angle = Math.atan(slope);
            var deltaX = distance * Math.cos(angle);
            var deltaY = distance * Math.sin(angle);
            var targetX, targetY;
            if (segment.a.y == segment.b.y) {
                targetX = targetOrigin.x;
            }
            else {
                var originLeft = (segment.a.x > segment.b.x) ? segment.b : segment.a;
                var originRight = (segment.a.x > segment.b.x) ? segment.a : segment.b;
                if ((targetOrigin == originLeft && slope > 0) || (targetOrigin == originRight && slope < 0)) {
                    targetX = targetOrigin.x + deltaX;
                }
                else if ((targetOrigin == originRight && slope > 0) || (targetOrigin == originLeft && slope < 0)) {
                    targetX = targetOrigin.x - deltaX;
                }
            }
            if (segment.a.x == segment.b.x) {
                targetY = targetOrigin.y;
            }
            else {
                var originLow = (segment.a.y > segment.b.y) ? segment.b : segment.a;
                var originHigh = (segment.a.y > segment.b.y) ? segment.a : segment.b;
                if (targetOrigin == originLow) {
                    targetY = targetOrigin.y + deltaY;
                }
                else if (targetOrigin == originHigh) {
                    targetY = targetOrigin.y - deltaY;
                }
            }
            var pointAlongPath = new Point(targetX, targetY);
            return pointAlongPath;
        };
        return Segment;
    })();
    Geometry.Segment = Segment;
})(Geometry || (Geometry = {}));
module.exports = Geometry;
