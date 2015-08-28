/// <reference path="../typings/tsd.d.ts"/>
import _ = require("lodash");
import Bezier = require("bezier-js");

module Geometry {

  export class Point {
    x: number;
    y: number;

    constructor(x:number,y:number) {
      this.x = x;
      this.y = y;
    }

    getCoordinate(){
      return [this.x,this.y];
    }

    distanceFromPoint(point:Point) {
      return Math.sqrt( Math.pow( (point.x-this.x), 2) + Math.pow( (point.y-this.y), 2) );
    }

    closestPointAmongPoints(points:Point[]) {
      var pointsByDistance = _.sortBy(points,function(point){
        return this.distanceFromPoint(point);
      },this);

      return pointsByDistance[0];
    }
  }

  export class BezierCurve {

    private curve:any;
    private arclength:number;
    private LUT:any[];

    constructor(endpointA:Point, controlPoint:Point, endpointB:Point) {
      //var y = new Bezier("sprocket");
      this.curve = new Bezier(endpointA.x,endpointA.y, controlPoint.x,controlPoint.y, endpointB.x,endpointB.y);
      this.arclength = this.curve.length();
      this.LUT = null;
    }

    flatten(averageUnitsPerSegment:number) {
      var steps = Math.floor(this.arclength/averageUnitsPerSegment);
      var LUT:any[] = this.curve.getLUT(steps);

      var segments:any[] = [];
      var totalSegmentLength = 0;

      _.each(LUT, function(point,idx){
        console.log("LUT",idx,point);

        if (idx<LUT.length-1) {
          var pointA = point;
          var pointB = LUT[idx+1];

          var segment = new Segment(pointA,pointB);

          segments.push(segment);
        }
      });

      this.LUT = LUT;

      return segments;
    }

  }


  export class Segment {

    a:Point;
    b:Point;
    length:number;

    constructor(endpointA:Point, endpointB:Point) {
      this.a = endpointA;
      this.b = endpointB;

      this.length = Math.sqrt( Math.pow(this.a.x-this.b.x,2) + Math.pow(this.a.y-this.b.y,2) );
      console.log("length",this.length);
    }
  }
}

export = Geometry;
