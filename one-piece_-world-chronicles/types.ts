export interface Choice {
  id: number;
  text: string;
  effect?: string;
  potentialReward?: string;
}

export interface Item {
  name:string;
  description: string;
  grade?: string; // e.g., Supreme Grade, Great Grade, Skillful Grade, etc.
}

export interface Ability extends Item {
    type: 'Devil Fruit' | 'Haki' | 'Fighting Style' | 'Swordsmanship' | 'Awakening';
}

export type DevilFruit = Item;

export type OriginSea = 'East Blue' | 'West Blue' | 'North Blue' | 'South Blue' | 'Grand Line';

export interface PlayerLoadout {
  name: string;
  outfit: Item;
  weapon: Item;
  title: string;
  equippedAbilities: Ability[];
  gender: 'Male' | 'Female' | 'Non-binary';
  faction: string; // e.g., 'Straw Hat Pirates', 'Marines', 'Unaffiliated'
  devilFruit: DevilFruit | null;
}

export interface PlayerInventory {
    outfits: Item[];
    weapons: Item[];
    titles: string[];
    abilities: Ability[];
}

export interface CrewMember {
  name: string;
  description: string;
  relationship: 'Nakama' | 'Ally' | 'Rival' | 'Enemy' | 'Captain' | 'First Mate';
}

export interface CustomizationOptions {
  outfits: Item[];
  weapons: Item[];
}

export interface Scene {
  story: string;
  choices: Choice[];
}

export interface PlayerStats {
    Agility: number;
    Strength: number;
    ConquerorsHaki: number;
    HakiControl: number; // Potential for Haki
    Willpower: number; // Resilience, related to Conqueror's Haki
    Endurance: number;
    Intelligence: number;
    Beli: number; // Currency
    Bounty: number; // Reputation/Threat Level
    DevilFruitMastery: number;
    ObservationHaki: number;
    ArmamentHaki: number;
}


export interface NewItem extends Item {
    type: 'outfit' | 'weapon';
}

export interface ItemUpdate {
  name: string; // The name of the item to update
  description?: string;
  grade?: string;
}

export interface AbilityUpdate {
  name: string; // The name of the ability to update
  description?: string;
}

export interface ScenePayload {
  story: string;
  choices: Choice[];
  statChanges: Partial<PlayerStats>;
  reputationAnalysis: string;
  newItem?: NewItem;
  newAbility?: Ability;
  newTitle?: string;
  newFaction?: string;
  majorEncounter?: { name: string; description: string; };
  newCrewMembers?: CrewMember[];
  crewUpdates?: { name: string; relationship: CrewMember['relationship']; description?: string; }[];
  itemUpdates?: ItemUpdate[];
  abilityUpdates?: AbilityUpdate[];
  isMajorEncounterOver?: boolean;
}