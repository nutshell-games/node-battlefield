var BattleField;
(function (BattleField) {
    (function (EnergyType) {
        EnergyType[EnergyType["Fire"] = 0] = "Fire";
        EnergyType[EnergyType["Water"] = 1] = "Water";
        EnergyType[EnergyType["Earth"] = 2] = "Earth";
        EnergyType[EnergyType["Wind"] = 3] = "Wind";
        EnergyType[EnergyType["Light"] = 4] = "Light";
        EnergyType[EnergyType["Dark"] = 5] = "Dark";
    })(BattleField.EnergyType || (BattleField.EnergyType = {}));
    var EnergyType = BattleField.EnergyType;
    var EnergyUnit = (function () {
        function EnergyUnit() {
        }
        return EnergyUnit;
    })();
    BattleField.EnergyUnit = EnergyUnit;
    var EnergyFactory = (function () {
        function EnergyFactory() {
        }
        EnergyFactory.prototype.start = function () {
        };
        EnergyFactory.prototype.stop = function () {
        };
        return EnergyFactory;
    })();
    BattleField.EnergyFactory = EnergyFactory;
})(BattleField || (BattleField = {}));
