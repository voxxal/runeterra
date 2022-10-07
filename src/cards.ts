import { CardType, UnitStats } from "./game.model";

export enum UnitGroup {
  Elite,
  Dragon,
  Yordle,
  MechaYordle,
  Fae,
  Darkin,
}

type Cards = {
  [key: string]: CardTemplate;
}

export type CardTemplate = UnitTemplate;

export interface CardTemplateBase {
  id: string,
  name: string;
  manaCost: number;
  text: string;
}

export interface UnitTemplate extends CardTemplateBase {
  type: CardType.Unit;
  group: UnitGroup;
  baseStats: UnitStats;
}

export const CARDS: Cards = {
  DEMACIA_CITHRIA_OF_CLOUDFIELD: { //TODO there is a offical internal id, please replace them.
    id: "DEMACIA_CITHRIA_OF_CLOUDFIELD",
    type: CardType.Unit,
    name: "Cithria of Cloudfield",
    manaCost: 1,
    group: UnitGroup.Elite,
    baseStats: {
      power: 2,
      health: 2,
      keywords: [],
    },
    text: "",
  },
};
