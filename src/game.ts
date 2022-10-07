import { CARDS, CardTemplate } from "./cards";
import { emit, remove } from "./listener";
import {
  Game,
  PlayerId,
  CardType,
  Nexus,
  Player,
  Card,
  UnitStats,
  CardUnit,
  Keyword,
} from "./game.model";

export const getPlayer = (game: Game, playerId: PlayerId): Player =>
  playerId === PlayerId.One ? game.player1 : game.player2;
export const otherPlayer = (id: PlayerId): PlayerId => id ^ 1;
export const forBoth = (game: Game, fn: (game: Game, id: PlayerId) => void) => {
  fn(game, PlayerId.One);
  fn(game, PlayerId.Two);
};

export const shuffle = <T>(arr: T[]) => {
  for (let i = 0; i < arr.length; i++) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
};

export const initGame = (deck1: string[], deck2: string[]): Game => {
  let game: Game = {
    round: 1,
    cards: new Map<number, Card>([
      [
        0,
        {
          id: 0,
          cardId: "NEXUS",
          owner: PlayerId.One,
          type: CardType.Nexus,
          manaCost: 0,
          player: {} as Player,
        },
      ],
      [
        1,
        {
          id: 1,
          cardId: "NEXUS",
          owner: PlayerId.Two,
          type: CardType.Nexus,
          manaCost: 0,
          player: {} as Player,
        },
      ],
    ]),
    nextCardId: 2,
    player1: {
      id: PlayerId.One,
      health: 20,
      board: [],
      hand: [],
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
      hand: [],
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

  (game.cards.get(0) as Nexus).player = game.player1;
  (game.cards.get(1) as Nexus).player = game.player2;
  // instanciate all the cards

  for (const card of deck1) {
    const id = game.nextCardId++;
    game.cards.set(id, buildCard(CARDS[card], id, PlayerId.One));
    game.player1.deck.push(id);
  }

  shuffle(game.player1.deck);

  for (const card of deck2) {
    const id = game.nextCardId++;
    game.cards.set(id, buildCard(CARDS[card], id, PlayerId.Two));
    game.player2.deck.push(id);
  }

  shuffle(game.player2.deck);

  return game;
};

export const buildCard = (
  cardTemplate: CardTemplate,
  id: number,
  owner: PlayerId
): Card => {
  switch (cardTemplate.type) {
    case CardType.Unit:
      return {
        id,
        cardId: cardTemplate.id,
        type: CardType.Unit,
        manaCost: cardTemplate.manaCost,
        owner,
        baseStats: cardTemplate.baseStats,
        health: cardTemplate.baseStats.health,
        buffs: [],
      };
      break;
  }
};

export const passTurn = (game: Game) => {
  if (game.canEndRound) {
    endRound(game);
    return;
  }

  game.priority = otherPlayer(game.priority);
  game.canEndRound = !game.actionOccured;
  game.actionOccured = false;
};

export const refillMana = (
  game: Game,
  playerId: PlayerId,
  amount: number = 10
) => {
  let player = getPlayer(game, playerId);
  player.mana = Math.min(player.mana + amount, player.maxMana);
};

export const gainManaGem = (
  game: Game,
  playerId: PlayerId,
  amount: number = 1
) => {
  let player = getPlayer(game, playerId);
  player.maxMana = Math.min(player.maxMana + amount, 10);

  if (player.maxMana === 10) {
    emit("enlightened", {});
  }
};

export const refillSpellMana = (
  game: Game,
  playerId: PlayerId,
  amount?: number
) => {
  let player = getPlayer(game, playerId);
  if (!amount) {
    amount = player.mana;
  }
  player.spellMana = Math.min(player.spellMana + amount, 3);
};

export const expireBuffs = (game: Game, playerId: PlayerId) => {
  const player = getPlayer(game, playerId);
  for (const i in player.board) {
    const cardId = player.board[i];
    const card = game.cards.get(cardId);
    if (!card) {
      player.board.splice(i as unknown as number, 1);
      continue;
    }

    if (card.type === CardType.Unit) {
      for (const j in card.buffs) {
        const buff = card.buffs[j];
        if (!buff.grant) {
          card.buffs.splice(j as unknown as number, 1);
        }
      }
    }
  }
};

export const endRound = (game: Game) => {
  emit("roundEnd", {});
  // effects like regen and ephemeral
  // give effects go away

  forBoth(game, expireBuffs);
  forBoth(game, refillSpellMana);

  passToken(game);
  startRound(game);
};

export const passToken = (game: Game) => {
  getPlayer(game, game.attackToken).hasAttackToken = false;
  game.attackToken = otherPlayer(game.attackToken);
  getPlayer(game, game.attackToken).hasAttackToken = true;
};

export const startRound = (game: Game) => {
  game.round++;
  forBoth(game, gainManaGem);

  emit("roundStart", {});
};

export const drawCard = (game: Game, playerId: PlayerId) => {
  const player = getPlayer(game, playerId);
  if (player.deck.length == 0) {
    alert(`Player with Id ${playerId} lost!`);
    throw new Error(`Player with Id ${playerId} lost!`);
  }

  player.hand.push(player.deck.pop() as number);
};

export const removeKeyword = (game: Game, cardId: number, keyword: Keyword) => {
  const card = game.cards.get(cardId);
  if (!card || card.type !== CardType.Unit) {
    return;
  }

  card.baseStats.keywords = card.baseStats.keywords.filter((k) => k !== keyword);

  for (const buff of card.buffs) {
    buff.keywords = buff.keywords.filter((k) => k !== keyword);
  }
};

export const damage = (
  game: Game,
  cardId: number,
  amount: number,
  overwhelm: boolean = false
) => {
  // This is only current for units but there should be a switch statement
  const target = game.cards.get(cardId);

  if (!target) {
    console.warn("You attempted to damage a non existant card.");
    return;
  }

  switch (target.type) {
    case CardType.Unit:
      const stats = absoluteStats(target);

      if (stats.keywords.includes(Keyword.Tough)) {
        amount = Math.max(amount - 1, 0);
      }

      if (amount - target.health > 0 && overwhelm) {
        damage(game, target.owner, amount - target.health);
      }

      if (stats.keywords.includes(Keyword.Barrier)) {
        amount = 0;
        removeKeyword(game, target.id, Keyword.Barrier);
      }

      target.health -= amount;

      emit(`damaged_${cardId}`, {});

      if (target.health <= 0) {
        // Die
        emit(`death_${cardId}`, {});
        console.log("YOU DIED AHAHAHAHAHHAHAHAHAHAHHA");
      }

      break;
    case CardType.Nexus:
      target.player.health -= amount;

      if (target.player.health <= 0) {
        alert(
          `Player with id ${target.player.id} died since their health dropped below 0`
        );
      }
      break;
  }
};

export const absoluteStats = (unit: Card): UnitStats => {
  if (!unit || unit.type !== CardType.Unit) {
    throw new Error("That isn't a unit.");
  }

  let stats: UnitStats = structuredClone(unit.baseStats);

  for (const buff of unit.buffs) {
    stats.power += buff.power;
    stats.health += buff.health;

    stats.keywords.concat(buff.keywords);
  }

  return stats;
};
