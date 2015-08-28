declare module BattleField {
    enum EnergyType {
        Fire = 0,
        Water = 1,
        Earth = 2,
        Wind = 3,
        Light = 4,
        Dark = 5,
    }
    class EnergyUnit {
        type: EnergyType;
    }
    class EnergyFactory {
        nextEnergy: EnergyUnit;
        spawnRate: number;
        isActive: boolean;
        producedEnergyTypes: EnergyType[];
        start(): void;
        stop(): void;
    }
}
