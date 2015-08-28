/// <reference path="../typings/tsd.d.ts" />

import G = require("./geometry");
import _ = require("lodash");

// segments must be contiguous
// enpoints must fall on segments



class Path {

  endpointA:G.Point;
  endpointB:G.Point;
  segments:G.Segment[];
  length:number;
  map:any;

  constructor(endpointA:G.Point, endpointB:G.Point, segments:G.Segment[]) {
    this.endpointA = endpointA;
    this.endpointB = endpointB;
    this.segments = segments;

    this.length = this.calculateLength();

    this.map = null;
  }

  private calculateLength() {
    var sumLength = 0;

    _.each(this.segments,sumSegmentLength);

    return sumLength;

    function sumSegmentLength(segment:G.Segment) {
      sumLength+=segment.length;
    }
  }

  getTweenPoints(speed:number, tweenInterval:number, startPoint:G.Point):any {

    console.log("getTweenPoints",speed,tweenInterval,startPoint);

  // given a unit's speed and tween interval,
  // what are all the tween points along the path?
  // tweenInterval in ms
  // speed in map units per second
  // startPoint is endpointA or endpointB of Path

  // returns array of map coordinates

    var tweenPositions:any[] = [];

    if (startPoint!==this.endpointA && startPoint!==this.endpointB) {
      return new Error("startPoint must be an endpoint of this Path");
    }

    tweenPositions.push(startPoint);

    var distanceTraveledPerTween = speed * tweenInterval/1000;
    var segmentIndex = 0;
    var remainderDistanceAlongSegment = 0;

    // if segment is less than remaining distance
    // subtract segments from distance
    // until remaining distance is less than current segment

    while (segmentIndex<this.segments.length-1) {

      var distanceTraveled = distanceTraveledPerTween - remainderDistanceAlongSegment;
      var proceedToNextSegment = true;

      while (proceedToNextSegment) {

        if (segmentIndex>this.segments.length-1) {
          proceedToNextSegment = false;
        } else if (distanceTraveled < this.segments[segmentIndex].length) {
          proceedToNextSegment = false;
        } else {
          console.log("distance until next tween",distanceTraveled);
          distanceTraveled-=this.segments[segmentIndex].length;
          segmentIndex++;
          console.log("segment index",segmentIndex);
        }

      }

      remainderDistanceAlongSegment = distanceTraveled;

      console.log("distance remaining:", remainderDistanceAlongSegment);


      if (segmentIndex<this.segments.length-1) {

        console.log("tween position at segment",segmentIndex);
        // find point at distance along segment
        var nextTweenPosition = this.getPointAtDistanceAlongSegment(distanceTraveled,segmentIndex,startPoint);
        tweenPositions.push(nextTweenPosition);
        segmentIndex++;
        console.log("segment index",segmentIndex);
      }


    }
    // continue to calculate positions until at final segment

    var endPoint = (startPoint==this.endpointA) ? this.endpointB : this.endpointA;

    tweenPositions.push(endPoint);


    return tweenPositions;
  }

  // how to determine which point of the segment is the origin?
  // the origin is the point closese to the origin of the path
  getPointAtDistanceAlongSegment(distance:number, segmentIndex:number, originEndpoint:G.Point) {

    var segment = this.segments[segmentIndex];
    var targetOrigin = originEndpoint.closestPointAmongPoints([segment.a,segment.b]);

    // with current segment
    // get point at distance along line
    // y - y1 = m(x - x1)

    var slope = (segment.a.y - segment.b.y) / (segment.a.x - segment.b.x);

    // y = slope * x;

    // angle = arctan (slope)
    var angle = Math.atan(slope);

    // distance = hypotenuse
    // if slope is positive

    // adjacent = x
    // cos angle = x / distance
    // x = distance * cos angle
    var deltaX = distance * Math.cos(angle);
    console.log("deltaX",deltaX);

    // opposite = y
    // sin angle = y / distance
    // y = distance * sin angle
    var deltaY = distance * Math.sin(angle);
    console.log("deltaY",deltaY);

    // how to apply deltaX and deltaY to origin?
    var targetX:number, targetY:number;

    // targetX
    if (segment.a.y==segment.b.y) {
      targetX = targetOrigin.x;
    } else {
      var originLeft = (segment.a.x>segment.b.x) ? segment.b : segment.a;
      var originRight = (segment.a.x>segment.b.x) ? segment.a : segment.b;

      if ( (targetOrigin==originLeft && slope>0) || (targetOrigin==originRight && slope<0) ) {
        targetX = targetOrigin.x + deltaX;
      } else if ( (targetOrigin==originRight && slope>0) || (targetOrigin==originLeft && slope<0) ) {
        targetX = targetOrigin.x - deltaX;
      }
    }

    // targetY
    if (segment.a.x==segment.b.x) {
      targetY = targetOrigin.y;
    } else {
      var originLow = (segment.a.y>segment.b.y) ? segment.b : segment.a;
      var originHigh = (segment.a.y>segment.b.y) ? segment.a : segment.b;

      if ( targetOrigin==originLow ) {
        targetY = targetOrigin.y + deltaY;
      } else if ( targetOrigin==originHigh ) {
        targetY = targetOrigin.y - deltaY;
      }
    }

    var pointAlongPath = new G.Point(targetX,targetY);

    return pointAlongPath;
  }
}

export = Path;
