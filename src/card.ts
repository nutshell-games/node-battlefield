module BattleField {

export enum CardState {
  InDeck, InHand, OnField, InDiscard
}


// export class CardGroup {
//
//   cards:Card[];
//
//   addCard( location:number, card:Card ) {
//
//   }
//
//   shuffle() {
//
//   }
//
// }

// export class Deck extends CardGroup {
//
//   draw( location:number, quantity:number, hand:Hand ) {
//
//   }
// }
//
// export class Hand extends CardGroup {
//
//   discard( location:number, quantity:number, discard:DiscardPile ) {
//
//   }
// }
//
// export class DiscardPile extends CardGroup {
//
// }

export class Card {

  state:CardState;
}

// export class BattleUnitCard extends Card {
//
// }
//
// export class TowerCard extends Card {
//
// }
//
// export class SpecialCard extends Card {
//
// }

}
