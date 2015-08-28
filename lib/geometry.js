/// <reference path="../typings/tsd.d.ts"/>
var _ = require("lodash");
var Bezier = require("bezier-js");
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
            this.curve = new Bezier(endpointA.x, endpointA.y, controlPoint.x, controlPoint.y, endpointB.x, endpointB.y);
            this.arclength = this.curve.length();
            this.LUT = null;
        }
        BezierCurve.prototype.flatten = function (averageUnitsPerSegment) {
            var steps = Math.floor(this.arclength / averageUnitsPerSegment);
            var LUT = this.curve.getLUT(steps);
            var segments = [];
            var totalSegmentLength = 0;
            _.each(LUT, function (point, idx) {
                console.log("LUT", idx, point);
                if (idx < LUT.length - 1) {
                    var pointA = point;
                    var pointB = LUT[idx + 1];
                    var segment = new Segment(pointA, pointB);
                    segments.push(segment);
                }
            });
            this.LUT = LUT;
            return segments;
        };
        return BezierCurve;
    })();
    Geometry.BezierCurve = BezierCurve;
    var Segment = (function () {
        function Segment(endpointA, endpointB) {
            this.a = endpointA;
            this.b = endpointB;
            this.length = Math.sqrt(Math.pow(this.a.x - this.b.x, 2) + Math.pow(this.a.y - this.b.y, 2));
            console.log("length", this.length);
        }
        return Segment;
    })();
    Geometry.Segment = Segment;
})(Geometry || (Geometry = {}));
module.exports = Geometry;
