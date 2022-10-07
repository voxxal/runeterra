export enum PlayerId {
  One,
  Two,
}

export interface Game {
  round: number;
  cards: Map<number, Card>;
  nextCardId: number;
  player1: Player;
  player2: Player;

  priority: PlayerId;
  actionOccured: boolean;
  canEndRound: boolean;
  attackToken: PlayerId;

  // I suspect the type will need to be PlayedSpell with includes targets and what not.
  spellStack: number[];
}

export interface Player {
  id: PlayerId;
  deck: number[];
  hand: number[];
  board: number[];
  health: number;
  mana: number;
  maxMana: number;
  spellMana: number;

  hasAttackToken: boolean;
}

export enum CardType {
  Nexus,
  Unit,
  Spell,
  Champion,
}

export type Card = Nexus | CardUnit | CardSpell;

// Maybe card instance
export interface CardBase {
  // Id is a unique number assigned to the card for it to be targeted.
  id: number;
  // Internal Card Id name
  cardId: string;
  owner: PlayerId;
  type: CardType;
  manaCost: number;
}

// Nexus isn't exactly a card but it can be a target so it should be considered one for this purpose
export interface Nexus extends CardBase {
  id: 0 | 1;
  cardId: "NEXUS";
  type: CardType.Nexus;
  manaCost: 0;

  player: Player;
}

export enum Keyword {
  Tough,
  Barrier,
  Elusive,
}

export interface UnitStats {
  power: number;
  health: number;
  keywords: Keyword[];
}

export interface UnitBuff extends UnitStats {
  grant: boolean;
}

export interface CardUnit extends CardBase {
  type: CardType.Unit;
  // This represents a units actual health, the baseStats represent maxHealth.
  health: number;
  // this might not be nessasary as we can just lookup the template.
  baseStats: UnitStats;
  buffs: UnitBuff[];
}

export interface CardSpell extends CardBase {
  type: CardType.Spell;
  keywords: Keyword[];
}
