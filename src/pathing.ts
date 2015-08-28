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
  bezier:G.BezierCurve;

  constructor(endpointA:G.Point, endpointB:G.Point, segments:G.Segment[], bezier:G.BezierCurve) {
    this.endpointA = endpointA;
    this.endpointB = endpointB;
    this.segments = segments;
    this.bezier = bezier;

    this.length = this.calculateLength();

    this.map = null;
  }

  calculateLength() {

    var sumLength = 0;

    _.each(this.segments,function(segment:G.Segment) {
      sumLength+=segment.length;
    });

    return sumLength;
  }

  getTweenPoints(speed:number, tweenInterval:number, originPoint:G.Point, destinationPoint:G.Point):any {

// given a first and second point along a curve
// how do you determine direction of movement,
// i.e. order of progression through sub-segments of curve

// is the movement positive or negative according to the t value of LUT points?
// any point on the curve will have a t value (0-1)
// compare the t values of origin and destination point

    console.log("getTweenPoints",speed,tweenInterval,originPoint,destinationPoint);

  // given a unit's speed and tween interval,
  // what are all the tween points along the path?
  // tweenInterval in ms
  // speed in map units per second
  // startPoint is endpointA or endpointB of Path

  // returns array of map coordinates

    var tweenPositions:any[] = [];

    // TODO check if origin and destination are on the path
    // if (startPoint!==this.endpointA && startPoint!==this.endpointB) {
    //   return new Error("startPoint must be an endpoint of this Path");
    // }

    // reverse order of segments if t value of origin is greater than destination
    var originT = this.bezier.reverseCompute(originPoint),
    destinationT = this.bezier.reverseCompute(destinationPoint);

    // TODO handle origin and destination points that are NOT the endpoints
    var segments:G.Segment[] = (originT<destinationT) ? this.segments : _.clone(this.segments).reverse();

    console.log("t values:",originT,destinationT);
    console.log(segments);

    tweenPositions.push(originPoint);

    var distanceTraveledPerTween = speed * tweenInterval/1000;
    var segmentIndex = 0;
    var remainderDistanceAlongSegment = 0;

    // if segment is less than remaining distance
    // subtract segments from distance
    // until remaining distance is less than current segment

    while (segmentIndex<segments.length-1) {

      var distanceTraveled = distanceTraveledPerTween - remainderDistanceAlongSegment;
      var proceedToNextSegment = true;

      while (proceedToNextSegment) {

        if (segmentIndex>segments.length-1) {
          proceedToNextSegment = false;
        } else if (distanceTraveled < segments[segmentIndex].length) {
          proceedToNextSegment = false;
        } else {
          //console.log("distance until next tween",distanceTraveled);
          distanceTraveled-=segments[segmentIndex].length;
          segmentIndex++;
          //console.log("segment index",segmentIndex);
        }

      }

      remainderDistanceAlongSegment = distanceTraveled;

      //console.log("distance remaining:", remainderDistanceAlongSegment);


      if (segmentIndex<segments.length-1) {

        //console.log("tween position at segment",segmentIndex);
        // find point at distance along segment
        //var nextTweenPosition = this.getPointAtDistanceAlongSegment(distanceTraveled,segmentIndex,originPoint);
        var nextTweenPosition = segments[segmentIndex].getPointAtDistanceAlongSegment(distanceTraveled,originT);

        tweenPositions.push(nextTweenPosition);
        segmentIndex++;
        //console.log("segment index",segmentIndex);
      }


    }
    // continue to calculate positions until at final segment

    tweenPositions.push(destinationPoint);


    return tweenPositions;
  }

  // how to determine which point of the segment is the origin?
  // the origin is the point closest to the origin of the path

  // the origin segment endpoint is the endpoint with a t value
  // closer to the t value of the movement origin point
  // getPointAtDistanceAlongSegment(distance:number, segmentIndex:number, originEndpoint:G.Point) {
  //
  //   var segment = this.segments[segmentIndex];
  //   var targetOrigin = originEndpoint.closestPointAmongPoints([segment.a,segment.b]);
  //
  //   // with current segment
  //   // get point at distance along line
  //   // y - y1 = m(x - x1)
  //
  //   var slope = (segment.a.y - segment.b.y) / (segment.a.x - segment.b.x);
  //
  //   // y = slope * x;
  //
  //   // angle = arctan (slope)
  //   var angle = Math.atan(slope);
  //
  //   // distance = hypotenuse
  //   // if slope is positive
  //
  //   // adjacent = x
  //   // cos angle = x / distance
  //   // x = distance * cos angle
  //   var deltaX = distance * Math.cos(angle);
  //   //console.log("deltaX",deltaX);
  //
  //   // opposite = y
  //   // sin angle = y / distance
  //   // y = distance * sin angle
  //   var deltaY = distance * Math.sin(angle);
  //   //console.log("deltaY",deltaY);
  //
  //   // how to apply deltaX and deltaY to origin?
  //   var targetX:number, targetY:number;
  //
  //   // targetX
  //   if (segment.a.y==segment.b.y) {
  //     targetX = targetOrigin.x;
  //   } else {
  //     var originLeft = (segment.a.x>segment.b.x) ? segment.b : segment.a;
  //     var originRight = (segment.a.x>segment.b.x) ? segment.a : segment.b;
  //
  //     if ( (targetOrigin==originLeft && slope>0) || (targetOrigin==originRight && slope<0) ) {
  //       targetX = targetOrigin.x + deltaX;
  //     } else if ( (targetOrigin==originRight && slope>0) || (targetOrigin==originLeft && slope<0) ) {
  //       targetX = targetOrigin.x - deltaX;
  //     }
  //   }
  //
  //   // targetY
  //   if (segment.a.x==segment.b.x) {
  //     targetY = targetOrigin.y;
  //   } else {
  //     var originLow = (segment.a.y>segment.b.y) ? segment.b : segment.a;
  //     var originHigh = (segment.a.y>segment.b.y) ? segment.a : segment.b;
  //
  //     if ( targetOrigin==originLow ) {
  //       targetY = targetOrigin.y + deltaY;
  //     } else if ( targetOrigin==originHigh ) {
  //       targetY = targetOrigin.y - deltaY;
  //     }
  //   }
  //
  //   var pointAlongPath = new G.Point(targetX,targetY);
  //
  //   return pointAlongPath;
  // }
}

export = Path;
