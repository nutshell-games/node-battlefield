var Player = (function () {
    function Player(options) {
        this.unitsOwned = [];
        this.unitsControlled = [];
        this.lifeTotal = options.lifeTotal;
        this.username = options.username;
        this.userID = options.userID;
        this.teamID = options.teamID;
    }
    Player.prototype.fieldUnit = function (unit) {
        this.unitsOwned.push(unit);
        this.unitsControlled.push(unit);
        unit.owner = this;
        unit.controller = this;
    };
    return Player;
})();
exports.Player = Player;
