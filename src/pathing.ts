/// <reference path="../typings/tsd.d.ts" />

import G = require("./geometry");
import _ = require("lodash");
import {BattleUnit} from "./battleUnit";
import {Checkpoint} from "./checkpoint";

// segments must be contiguous
// enpoints must fall on segments

class Path {

  endpointA:G.Point;
  endpointB:G.Point;
  segments:G.Segment[];
  length:number;
  map:any;
  bezier:G.BezierCurve;
  units:BattleUnit[] = [];
  checkpoints:Checkpoint[] = [];

  constructor(endpointA:G.Point, endpointB:G.Point, segments:G.Segment[], bezier:G.BezierCurve) {
    this.endpointA = endpointA;
    this.endpointB = endpointB;
    this.segments = segments;
    this.bezier = bezier;

    //automatically create checkpoints at endpoints
    this.checkpoints.push(new Checkpoint(endpointA));
    this.checkpoints.push(new Checkpoint(endpointB));

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

  removeUnit(unit:BattleUnit) {
    this.units = _.without(this.units,unit);
  }

  addUnit(unit:BattleUnit) {
    if (!_.includes(this.units,unit)) {
      this.units.push(unit);
    }
  }

  addCheckpoint(checkpoint:Checkpoint) {

  }

}

export = Path;
