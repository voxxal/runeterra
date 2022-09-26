export enum UnitGroup {
    Elite,
    Dragon,
    Yordle,
    MechaYordle,
    Fae,
    Darkin
}

export const CARDS = {
  DEMACIA_CITHRIA_OF_CLOUDFIELD: {
    name: "Cithria of Cloudfield",
    manaCost: 1,
    group: UnitGroup,
    baseStats: {
      power: 2,
      health: 2,
    },
    text: ""
  },
};
