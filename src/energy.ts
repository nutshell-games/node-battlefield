module BattleField {
  
  export enum EnergyType {
    Fire, Water, Earth, Wind, Light, Dark
  }

  export class EnergyUnit {
    type:EnergyType;

  }

  export class EnergyFactory {
    nextEnergy:EnergyUnit;
    spawnRate:number;
    isActive:boolean;
    producedEnergyTypes:EnergyType[];

    start() {

    }

    stop() {

    }
  }
}
