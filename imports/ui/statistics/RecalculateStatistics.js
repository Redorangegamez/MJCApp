import Constants from '../../api/Constants';
import Players from '../../api/Players';
import { JapaneseHands } from '../../api/GameDatabases';

export default class RecalculateStatistics {
    constructor (japaneseLeagueName) {
        this.japaneseLeagueName = japaneseLeagueName;
        this.played_games = JapaneseHands.find({ $or: [{ east_player: "iForgot" }, { south_player: "iForgot" }, { west_player: "iForgot" }, { north_player: "iForgot" }] });
        this.games = 0;
        this.games_winning = 0;
        this.total_hands = 0;
        this.total_hands_winning = 0;
        this.deal_in_hands = 0;
        this.deal_in_total = 0;
        this.win_hands = 0;
        this.win_points = 0;
        this.self_draw_total = 0;
    }
    calcDealInTotal() {
        this.played_games.forEach(game => this.calcLosing(game));
    }
    calcWinTotal() {
        this.played_games.forEach(game => this.calcWinning(game));
    }

    calcLosing(game) {
        this.games++;
        console.log("games: " + this.games);
        let hands = game.all_hands_after_game;
        for (let j in hands) {
            const hand = hands[j];
            this.total_hands++;
            let riichiHistory = hand.riichiLog;
            if (hand.handType === Constants.DEAL_IN) {
                let eastDeltaTemp = Number(hand.eastDelta);
                let southDeltaTemp = Number(hand.southDelta);
                let westDeltaTemp = Number(hand.westDelta);
                let northDeltaTemp = Number(hand.northDelta);
                if (riichiHistory.east === true && ((Number(hand.eastDelta) + 1000) !== 0)) {
                    eastDeltaTemp += 1000;
                } else if (riichiHistory.south === true && ((Number(hand.southDelta) + 1000) !== 0)) {
                    southDeltaTemp += 1000;
                } else if (riichiHistory.west === true && ((Number(hand.westDelta) + 1000) !== 0)) {
                    westDeltaTemp += 1000;
                } else if (riichiHistory.north === true && ((Number(hand.northDelta) + 1000) !== 0)) {
                    northDeltaTemp += 1000;
                }
                if (eastDeltaTemp < 0 && game.east_player === this.japaneseLeagueName) {
                    this.deal_in_hands++;
                    this.deal_in_total += eastDeltaTemp;
                } else if (southDeltaTemp < 0 && game.south_player === this.japaneseLeagueName) {
                    this.deal_in_hands++;
                    this. deal_in_total += southDeltaTemp;
                } else if (westDeltaTemp < 0 && game.west_player === this.japaneseLeagueName) {
                    this.deal_in_hands++;
                    this.deal_in_total += westDeltaTemp;
                } else if (northDeltaTemp < 0 && game.north_player === this.japaneseLeagueName) {
                    this.deal_in_hands++;
                    this.deal_in_total += northDeltaTemp;
                }
            }
        }
        let hands2 = game.all_hands;
        for (let k in hands2) {
            let hand = hands2[k];
            this.total_hands++;
            if (hand.handType === Constants.DEAL_IN) {
                if (hand.eastDelta < -1000 && game.east_player === this.japaneseLeagueName) {
                    this.deal_in_hands++;
                    this.deal_in_total += hand.eastDelta;
                } else if (hand.southDelta < -1000 && game.south_player === this.japaneseLeagueName) {
                    this.deal_in_hands++;
                    this.deal_in_total += hand.southDelta;
                } else if (hand.westDelta < -1000 && game.west_player === this.japaneseLeagueName) {
                    this.deal_in_hands++;
                    this.deal_in_total += hand.westDelta;
                } else if (hand.northDelta < -1000 && game.north_player === this.japaneseLeagueName) {
                    this.deal_in_hands++;
                    this.deal_in_total += hand.northDelta;
                }
            }
        }
        console.log("Total Hands: " + this.total_hands);
        console.log("Deal In #: " + this.deal_in_hands);
        console.log("Deal In Total: " + this.deal_in_total);
        // if (game.east_player === japaneseLeagueName) {
        //     console.log(game.east_score);
        // } else if (game.south_player === japaneseLeagueName) {
        //     console.log(game.south_score);
        // } else if (game.west_player === japaneseLeagueName) {
        //     console.log(game.west_score);
        // } else if (game.north_player === japaneseLeagueName) {
        //     console.log(game.north_score);
        // }
    }

    calcWinning(game) {
        this.games_winning++;
        console.log("games: " + this.games_winning);
        let hands = game.all_hands_after_game;
        for (let j in hands) {
            const hand = hands[j];
            this.total_hands_winning++;
            let riichiHistory = hand.riichiLog;
            let eastDeltaTemp = Number(hand.eastDelta);
            let southDeltaTemp = Number(hand.southDelta);
            let westDeltaTemp = Number(hand.westDelta);
            let northDeltaTemp = Number(hand.northDelta);
            if (hand.handType === Constants.SELF_DRAW) {
                if (eastDeltaTemp > 0 && game.east_player === this.japaneseLeagueName) {
                    this.self_draw_total++;
                } else if (southDeltaTemp > 0 && game.south_player === this.japaneseLeagueName) {
                    this.self_draw_total++;
                } else if (westDeltaTemp > 0 && game.west_player === this.japaneseLeagueName) {
                    this.self_draw_total++;
                } else if (northDeltaTemp > 0 && game.north_player === this.japaneseLeagueName) {
                    this.self_draw_total++;
                }
            }
            if (hand.handType === Constants.DEAL_IN || hand.handType === Constants.SELF_DRAW) {
                // if (riichiHistory.east === true && ((Number(hand.eastDelta) + 1000) !== 0)) {
                //     eastDeltaTemp += 1000;
                // } else if (riichiHistory.south === true && ((Number(hand.southDelta) + 1000) !== 0)) {
                //     southDeltaTemp += 1000;
                // } else if (riichiHistory.west === true && ((Number(hand.westDelta) + 1000) !== 0)) {
                //     westDeltaTemp += 1000;
                // } else if (riichiHistory.north === true && ((Number(hand.northDelta) + 1000) !== 0)) {
                //     northDeltaTemp += 1000;
                // }
                if (eastDeltaTemp > 0 && game.east_player === this.japaneseLeagueName) {
                    this.win_hands++;
                    this.win_points += eastDeltaTemp;
                } else if (southDeltaTemp > 0 && game.south_player === this.japaneseLeagueName) {
                    this.win_hands++;
                    this.win_points += southDeltaTemp;
                } else if (westDeltaTemp > 0 && game.west_player === this.japaneseLeagueName) {
                    this.win_hands++;
                    this.win_points += westDeltaTemp;
                } else if (northDeltaTemp > 0 && game.north_player === this.japaneseLeagueName) {
                    this.win_hands++;
                    this.win_points += northDeltaTemp;
                }
            }
        }
        let hands2 = game.all_hands;
        for (let k in hands2) {
            let hand = hands2[k];
            this.total_hands++;
            if (hand.handType === Constants.DEAL_IN || hand.handType === Constants.SELF_DRAW) {
                if (hand.eastDelta > 0 && game.east_player === this.japaneseLeagueName) {
                    this.win_hands++;
                    this.win_points += hand.eastDelta;
                } else if (hand.southDelta > 0 && game.south_player === this.japaneseLeagueName) {
                    this.win_hands++;
                    this.win_points += hand.southDelta;
                } else if (hand.westDelta > 0 && game.west_player === this.japaneseLeagueName) {
                    this.win_hands++;
                    this.win_points += hand.westDelta;
                } else if (hand.northDelta > 0 && game.north_player === this.japaneseLeagueName) {
                    this.win_hands++;
                    this.win_points += hand.northDelta;
                }
            }
        }
        console.log("Win Total: " + this.win_points);
        console.log("Win #: " + this.win_hands);
        console.log("Self Draw Total: " + this.self_draw_total);
    }
}