/// <reference path="../typings/tsd.d.ts"/>
var _ = require("lodash");
var Terrain = (function () {
    function Terrain() {
    }
    return Terrain;
})();
exports.Terrain = Terrain;
var Map = (function () {
    function Map(width, height) {
    }
    Map.prototype.generateTerrain = function (terrainConfig) {
        _.each(terrainConfig, function (terrainData) {
            this.terrain.push(new Terrain());
        }, this);
    };
    Map.prototype.getTerrainAtPoint = function (x, y) {
        return [];
    };
    return Map;
})();
exports.Map = Map;
