import { emit } from "./listener";

export enum PlayerId {
  One,
  Two,
}

export const getPlayer = (game: GameState, playerId: PlayerId): Player =>
  playerId === PlayerId.One ? game.player1 : game.player2;
export const otherPlayer = (id: PlayerId): PlayerId => id ^ 1;

export const initGame = (deck1: string[], deck2: string[]): GameState => {
  let gameState: GameState = {
    round: 1,
    cards: new Map<number, Card>([
      [
        0,
        {
          id: 0,
          cardId: "NEXUS",
          type: CardType.Nexus,
          manaCost: 0,
          player: null,
        },
      ],
      [
        1,
        {
          id: 0,
          cardId: "NEXUS",
          type: CardType.Nexus,
          manaCost: 0,
          player: null,
        },
      ],
    ]),
    nextCardId: 2,
    player1: {
      id: PlayerId.One,
      health: 20,
      board: [],
      deck: [],
      mana: 1,
      maxMana: 1,
      spellMana: 0,
      hasAttackToken: true,
    },
    player2: {
      id: PlayerId.Two,
      health: 20,
      board: [],
      deck: [],
      mana: 1,
      maxMana: 1,
      spellMana: 0,

      hasAttackToken: false,
    },
    priority: PlayerId.One,
    actionOccured: false,
    canEndRound: false,
    attackToken: PlayerId.One,
    spellStack: [],
  };

  (gameState.cards.get(0) as Nexus).player = gameState.player1;
  (gameState.cards.get(1) as Nexus).player = gameState.player2;
  // instanciate all the cards
  return gameState;
};

export const passTurn = (game: GameState) => {
  if (game.canEndRound) {
    endRound(game);
    return;
  }

  game.priority = otherPlayer(game.priority);
  game.canEndRound = !game.actionOccured;
  game.actionOccured = false;
};

export const refillMana = (
  game: GameState,
  playerId: PlayerId,
  amount: number = 10
) => {
  let player = getPlayer(game, playerId);
  player.mana = Math.min(player.mana + amount, player.maxMana);
};

export const refillSpellMana = (
  game: GameState,
  playerId: PlayerId,
  amount?: number
) => {
  let player = getPlayer(game, playerId);
  if (!amount) {
    amount = player.mana;
  }
  player.spellMana = Math.min(player.spellMana + amount, 3);
};

export const endRound = (game: GameState) => {
  emit("roundEnd", {});
  // effects like regen and ephemeral
  // give effects go away

  refillSpellMana(game, PlayerId.One);
  refillSpellMana(game, PlayerId.Two);

  passToken(game);
  startRound(game);
};

export const passToken = (game: GameState) => {
  getPlayer(game, game.attackToken).hasAttackToken = false;
  game.attackToken = otherPlayer(game.attackToken);
  getPlayer(game, game.attackToken).hasAttackToken = true;
}

export const startRound = (game: GameState) => {
  game.round++;
  game.player1.maxMana++;
  game.player2.maxMana++;

  emit("roundStart", {});
};

export const drawCard = (game: GameState, playerId: PlayerId) => {
  
}

export interface GameState {
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
  deck: Card[];
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

type Card = Nexus | CardUnit | CardSpell;

export interface CardBase {
  // Id is a unique number assigned to the card for it to be targeted.
  id: number;
  // Internal Card Id name
  cardId: string;
  type: CardType;
  manaCost: number;
  health: number;
}

// Nexus isn't exactly a card but it can be a target so it should be considered one for this purpose
export interface Nexus {
  id: 0 | 1;
  cardId: "NEXUS";
  type: CardType.Nexus;
  manaCost: 0;

  player: Player | null;
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
