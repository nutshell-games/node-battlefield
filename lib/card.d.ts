declare module BattleField {
    enum CardState {
        InDeck = 0,
        InHand = 1,
        OnField = 2,
        InDiscard = 3,
    }
    class Card {
        state: CardState;
    }
}
