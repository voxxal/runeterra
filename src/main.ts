import { Game } from "./game.model";
import { damage, drawCard, endRound, initGame } from "./game";

const game: Game = initGame(["DEMACIA_CITHRIA_OF_CLOUDFIELD"], ["DEMACIA_CITHRIA_OF_CLOUDFIELD"]);


//@ts-expect-error
window.game = game;
//@ts-expect-error
window.damage = damage;
//@ts-expect-error
window.drawCard = drawCard;
//@ts-expect-error
window.endRound = endRound;