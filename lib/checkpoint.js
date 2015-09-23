/// <reference path="../typings/tsd.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Trigger = (function () {
    function Trigger() {
    }
    return Trigger;
})();
exports.Trigger = Trigger;
var Checkpoint = (function () {
    function Checkpoint(point) {
    }
    return Checkpoint;
})();
exports.Checkpoint = Checkpoint;
var PlayerHQ = (function (_super) {
    __extends(PlayerHQ, _super);
    function PlayerHQ() {
        _super.apply(this, arguments);
    }
    return PlayerHQ;
})(Checkpoint);
exports.PlayerHQ = PlayerHQ;
