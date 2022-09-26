export enum PlayerId {
  One,
  Two,
}

export const initGame = (): GameState => {
  return {
    round: 1,
    player1: {
      id: PlayerId.One,
      health: 20,
      deck: [],
      mana: 1,
      maxMana: 1,
      spellMana: 0,
    },
    player2: {
      id: PlayerId.Two,
      health: 20,
      deck: [],
      mana: 1,
      maxMana: 1,
      spellMana: 0,
    },
    priority: PlayerId.One,
    alreadyAttacked: false,
    attackToken: PlayerId.One,
    spellStack: [],
  };
};

export const passTurn = () =>  {

}

export interface GameState {
  round: number;
  player1: Player;
  player2: Player;

  priority: PlayerId;
  alreadyAttacked: boolean;
  attackToken: PlayerId;

  // I suspect the type will need to be PlayedSpell with includes targets and what not.
  spellStack: CardSpell[];
}

export interface Player {
  id: PlayerId;
  deck: Card[];
  health: number;
  mana: number;
  maxMana: number;
  spellMana: number;
}

export enum CardType {
  Unit,
  Spell,
  Champion,
}

type Card = CardUnit | CardSpell;

export interface CardBase {
  // Id is a unique number assigned to the card for it to be targeted.
  id: number;
  // Internal Card Id name
  cardId: string;
  type: CardType;
  manaCost: number;
}

export enum Keyword {
  Elusive,
}

export interface UnitStats {
  power: number;
  health: number;
}

export interface UnitBuff extends UnitStats {
  keywords: Keyword[];
  grant: boolean;
}

export interface CardUnit extends CardBase {
  type: CardType.Unit;
  // This represents a units actual health, the baseStats represent maxHealth.
  health: number;
  baseStats: UnitStats;
  buffs: UnitBuff;
  keywords: Keyword[];
}

export interface CardSpell extends CardBase {
  type: CardType.Spell;
  keywords: Keyword[];
}
