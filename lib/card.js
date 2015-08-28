var BattleField;
(function (BattleField) {
    (function (CardState) {
        CardState[CardState["InDeck"] = 0] = "InDeck";
        CardState[CardState["InHand"] = 1] = "InHand";
        CardState[CardState["OnField"] = 2] = "OnField";
        CardState[CardState["InDiscard"] = 3] = "InDiscard";
    })(BattleField.CardState || (BattleField.CardState = {}));
    var CardState = BattleField.CardState;
    var Card = (function () {
        function Card() {
        }
        return Card;
    })();
    BattleField.Card = Card;
})(BattleField || (BattleField = {}));
