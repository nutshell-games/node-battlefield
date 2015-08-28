/// <reference path="../typings/tsd.d.ts" />
var G = require("./geometry");
var _ = require("lodash");
var Path = (function () {
    function Path(endpointA, endpointB, segments, bezier) {
        this.endpointA = endpointA;
        this.endpointB = endpointB;
        this.segments = segments;
        this.bezier = bezier;
        this.length = this.calculateLength();
        this.map = null;
    }
    Path.prototype.calculateLength = function () {
        var sumLength = 0;
        _.each(this.segments, function (segment) {
            sumLength += segment.length;
        });
        return sumLength;
    };
    Path.prototype.getTweenPoints = function (speed, tweenInterval, originPoint, destinationPoint) {
        // given a first and second point along a curve
        // how do you determine direction of movement,
        // i.e. order of progression through sub-segments of curve
        console.log("getTweenPoints", speed, tweenInterval, originPoint, destinationPoint);
        var tweenPositions = [];
        var originT = this.bezier.reverseCompute(originPoint), destinationT = this.bezier.reverseCompute(destinationPoint);
        var segments = (originT < destinationT) ? this.segments : _.clone(this.segments).reverse();
        console.log("t values:", originT, destinationT);
        console.log(segments);
        tweenPositions.push(originPoint);
        var distanceTraveledPerTween = speed * tweenInterval / 1000;
        var segmentIndex = 0;
        var remainderDistanceAlongSegment = 0;
        while (segmentIndex < segments.length - 1) {
            var distanceTraveled = distanceTraveledPerTween - remainderDistanceAlongSegment;
            var proceedToNextSegment = true;
            while (proceedToNextSegment) {
                if (segmentIndex > segments.length - 1) {
                    proceedToNextSegment = false;
                }
                else if (distanceTraveled < segments[segmentIndex].length) {
                    proceedToNextSegment = false;
                }
                else {
                    distanceTraveled -= segments[segmentIndex].length;
                    segmentIndex++;
                }
            }
            remainderDistanceAlongSegment = distanceTraveled;
            if (segmentIndex < segments.length - 1) {
                var nextTweenPosition = this.getPointAtDistanceAlongSegment(distanceTraveled, segmentIndex, originPoint);
                tweenPositions.push(nextTweenPosition);
                segmentIndex++;
            }
        }
        tweenPositions.push(destinationPoint);
        return tweenPositions;
    };
    Path.prototype.getPointAtDistanceAlongSegment = function (distance, segmentIndex, originEndpoint) {
        var segment = this.segments[segmentIndex];
        var targetOrigin = originEndpoint.closestPointAmongPoints([segment.a, segment.b]);
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
        var pointAlongPath = new G.Point(targetX, targetY);
        return pointAlongPath;
    };
    return Path;
})();
module.exports = Path;
