/// <reference path="../typings/tsd.d.ts" />
var G = require("./geometry");
var _ = require("lodash");
var Path = (function () {
    function Path(endpointA, endpointB, segments) {
        this.endpointA = endpointA;
        this.endpointB = endpointB;
        this.segments = segments;
        this.length = this.calculateLength();
        this.map = null;
    }
    Path.prototype.calculateLength = function () {
        var sumLength = 0;
        _.each(this.segments, sumSegmentLength);
        return sumLength;
        function sumSegmentLength(segment) {
            sumLength += segment.length;
        }
    };
    Path.prototype.getTweenPoints = function (speed, tweenInterval, startPoint) {
        console.log("getTweenPoints", speed, tweenInterval, startPoint);
        var tweenPositions = [];
        if (startPoint !== this.endpointA && startPoint !== this.endpointB) {
            return new Error("startPoint must be an endpoint of this Path");
        }
        tweenPositions.push(startPoint);
        var distanceTraveledPerTween = speed * tweenInterval / 1000;
        var segmentIndex = 0;
        var remainderDistanceAlongSegment = 0;
        while (segmentIndex < this.segments.length - 1) {
            var distanceTraveled = distanceTraveledPerTween - remainderDistanceAlongSegment;
            var proceedToNextSegment = true;
            while (proceedToNextSegment) {
                if (segmentIndex > this.segments.length - 1) {
                    proceedToNextSegment = false;
                }
                else if (distanceTraveled < this.segments[segmentIndex].length) {
                    proceedToNextSegment = false;
                }
                else {
                    console.log("distance until next tween", distanceTraveled);
                    distanceTraveled -= this.segments[segmentIndex].length;
                    segmentIndex++;
                    console.log("segment index", segmentIndex);
                }
            }
            remainderDistanceAlongSegment = distanceTraveled;
            console.log("distance remaining:", remainderDistanceAlongSegment);
            if (segmentIndex < this.segments.length - 1) {
                console.log("tween position at segment", segmentIndex);
                var nextTweenPosition = this.getPointAtDistanceAlongSegment(distanceTraveled, segmentIndex, startPoint);
                tweenPositions.push(nextTweenPosition);
                segmentIndex++;
                console.log("segment index", segmentIndex);
            }
        }
        var endPoint = (startPoint == this.endpointA) ? this.endpointB : this.endpointA;
        tweenPositions.push(endPoint);
        return tweenPositions;
    };
    Path.prototype.getPointAtDistanceAlongSegment = function (distance, segmentIndex, originEndpoint) {
        var segment = this.segments[segmentIndex];
        var targetOrigin = originEndpoint.closestPointAmongPoints([segment.a, segment.b]);
        var slope = (segment.a.y - segment.b.y) / (segment.a.x - segment.b.x);
        var angle = Math.atan(slope);
        var deltaX = distance * Math.cos(angle);
        console.log("deltaX", deltaX);
        var deltaY = distance * Math.sin(angle);
        console.log("deltaY", deltaY);
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
        var pointAlongPath = new G.Point(targetX, targetY);
        return pointAlongPath;
    };
    return Path;
})();
module.exports = Path;
