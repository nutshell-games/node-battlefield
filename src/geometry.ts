/// <reference path="../typings/tsd.d.ts"/>
import _ = require("lodash");
import Bezier = require("bezier-js");
import QuadraticSolver = require("solve-quadratic-equation");

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
      var pointsByDistance = _.sortBy(points,function(point:Point){
        return this.distanceFromPoint(point);
      },this);

      return pointsByDistance[0];
    }
  }

  export class BezierCurve {

    private curve:any;
    private arclength:number;
    LUT:Point[] = [];

    constructor(endpointA:Point, controlPoint:Point, endpointB:Point) {
      //var y = new Bezier("sprocket");
      this.curve = new Bezier(endpointA.x,endpointA.y, controlPoint.x,controlPoint.y, endpointB.x,endpointB.y);
      this.arclength = this.curve.length();
    }

    flatten(averageUnitsPerSegment:number) {
      var steps = Math.floor(this.arclength/averageUnitsPerSegment);
      var LUT:Point[] = this.curve.getLUT(steps);

      var segments:any[] = [];
      var totalSegmentLength = 0;

      _.each(LUT, function(point:Point,idx:number){
        console.log("LUT",idx,point);

        if (idx<LUT.length-1) {
          var pointA = point, pointB = LUT[idx+1];
          var tValueForA = this.reverseCompute(pointA),
          tValueForB = this.reverseCompute(pointB);

          var segment = new Segment(pointA,pointB,tValueForA,tValueForB);

          segments.push(segment);
        }
      },this);

      this.LUT = LUT;

      return segments;
    }

    reverseCompute(point:Point):number {
      // get t value for Point
        var x = point.x, y = point.y, bezier = this.curve;
        var tValue:number;

        // shortcuts
        if (x==bezier.points[0].x  && y==bezier.points[0].y) {
          return 0;
        }
        if (x==bezier.points[bezier.order].x  && y==bezier.points[bezier.order].y) {
          return 1;
        }

        var p = bezier.points;

        // plain computation
        if (bezier.order===2) {
          var a = (p[0].x)+(-2*p[1].x)+(p[2].x); // *t^2
          var b = (2*p[1].x)+(-2*p[0].x); // *t
          var c = p[0].x - x;

          var roots:number[] = QuadraticSolver(a,b,c);

          // although there are two roots, i.e. possible t values,
          // the correct point is consistently the point
          // derived from the second or larger root/t value
          tValue = roots[1];
        }


        return tValue;
        // var mt = 1-t,
        //     mt2 = mt*mt,
        //     t2 = t*t,
        //     a,b,c,d = 0,
        //     p = this.points;
        // if(this.order===2) {
        //   p = [p[0], p[1], p[2], ZERO];
        //   a = mt2;
        //   b = mt*t*2;
        //   c = t2;
        //
        //   x: a*p[0].x + b*p[1].x + c*p[2].x + d*p[3].x,
        //
        //   x = (1-t)*(1-t)*p[0].x + ((1-t)*t*2)*p[1].x + (t*t)*p[2].x
        //
        //   (1 - 2t + t^2)*p[0].x + (t-t^2)*2*p[1].x + t^2*p[2].x
        //
        //   p[0].x + (- 2*p[0].x)*t + (p[0].x)*t^2
        //   (2*p[1].x)*t + (-2*p[1].x)*t^2
        //   (p[2].x)*t^2
        //
        //   (p[0].x)+(-2*p[1].x)+(p[2].x) *t^2
        //   (2*p[1].x)+(- 2*p[0].x) *t
        //   p[0].x

        // if(this.order===3) {
        //   a = mt2*mt;
        //   b = mt2*t*3;
        //   c = mt*t2*3;
        //   d = t*t2;
        // }
        // var ret = {
        //   x: a*p[0].x + b*p[1].x + c*p[2].x + d*p[3].x,
        //   y: a*p[0].y + b*p[1].y + c*p[2].y + d*p[3].y
        // };
        // if(this._3d) {
        //   ret.z = a*p[0].z + b*p[1].z + c*p[2].z + d*p[3].z;
        // }
        // return ret;
    }

  }

  export class Segment {

    a:Point;
    b:Point;
    tValueForA:number;
    tValueForB:number;
    length:number;

    constructor(endpointA:Point, endpointB:Point, tValueForA:number, tValueForB:number) {
      this.a = endpointA;
      this.b = endpointB;
      this.tValueForA = tValueForA;
      this.tValueForB = tValueForB;

      this.length = Math.sqrt( Math.pow(this.a.x-this.b.x,2) + Math.pow(this.a.y-this.b.y,2) );
      console.log("length",this.length);
    }

    // how to determine which point of the segment is the origin?
    // the origin is the point closest to the origin of the path

    // the origin segment endpoint is the endpoint with a t value
    // closer to the t value of the reference (movement) origin point
    getPointAtDistanceAlongSegment(distance:number, referencePointTValue:number) {

      var segment = this;
      //var targetOrigin = originEndpoint.closestPointAmongPoints([segment.a,segment.b]);
      var targetOrigin = Math.abs(referencePointTValue-segment.tValueForA) < Math.abs(referencePointTValue-segment.tValueForB) ? segment.a : segment.b;

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
      //console.log("deltaX",deltaX);

      // opposite = y
      // sin angle = y / distance
      // y = distance * sin angle
      var deltaY = distance * Math.sin(angle);
      //console.log("deltaY",deltaY);

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

      var pointAlongPath = new Point(targetX,targetY);

      return pointAlongPath;
    }
  }
}

export = Geometry;
