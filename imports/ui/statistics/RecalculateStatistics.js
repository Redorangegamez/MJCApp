import Constants from '../../api/Constants';
import Players from '../../api/Players';
import { JapaneseHands } from '../../api/GameDatabases';

export default {
    calcDealInTotal(japaneseLeagueName) {
        let played_games = [
                {
                    _id: '8FdNAP3p67fJdBB88',
                    timestamp: 1674616416562,
                    east_player: 'Rizeng',
                    south_player: '三色同順',
                    west_player: 'btsfan69420',
                    north_player: 'iForgot',
                    east_score: -6500,
                    south_score: 39800,
                    west_score: 40100,
                    north_score: 26600,
                    east_elo_after_game: 1472.34260830793,
                    south_elo_after_game: 1519.836761427517,
                    west_elo_after_game: 1535.8479129566203,
                    north_elo_after_game: 1497.6803379650678,
                    all_hands_after_game: [
                        {
                            handType: 'dealin',
                            round: 1,
                            bonus: 0,
                            points: '5',
                            fu: '30',
                            dora: '4',
                            eastDelta: -9000,
                            southDelta: 9000,
                            westDelta: 0,
                            northDelta: 0,
                            riichiLog: { east: true, south: true, west: false, north: false }
                        },
                        {
                            handType: 'dealin',
                            round: 2,
                            bonus: 0,
                            points: '2',
                            fu: '40',
                            dora: '1',
                            eastDelta: -3900,
                            southDelta: 3900,
                            westDelta: 0,
                            northDelta: 0,
                            riichiLog: { east: false, south: true, west: false, north: false }
                        },
                        {
                            handType: 'selfdraw',
                            round: 2,
                            bonus: 1,
                            points: '5',
                            fu: '25',
                            dora: '2',
                            eastDelta: -2100,
                            southDelta: -4100,
                            westDelta: 8300,
                            northDelta: -2100,
                            riichiLog: { east: false, south: false, west: false, north: false }
                        },
                        {
                            handType: 'dealin',
                            round: 3,
                            bonus: 0,
                            points: '2',
                            fu: '30',
                            dora: '1',
                            eastDelta: 2000,
                            southDelta: 0,
                            westDelta: 0,
                            northDelta: -2000,
                            riichiLog: { east: false, south: false, west: false, north: false }
                        },
                        {
                            handType: 'selfdraw',
                            round: 4,
                            bonus: 0,
                            points: '3',
                            fu: '30',
                            dora: '2',
                            eastDelta: -2000,
                            southDelta: 7000,
                            westDelta: -2000,
                            northDelta: -3000,
                            riichiLog: { east: true, south: false, west: true, north: true }
                        },
                        {
                            handType: 'dealin',
                            round: 5,
                            bonus: 0,
                            points: '4',
                            fu: '30',
                            dora: '1',
                            eastDelta: -8700,
                            southDelta: 0,
                            westDelta: 0,
                            northDelta: 8700,
                            riichiLog: { east: true, south: false, west: false, north: true }
                        },
                        {
                            handType: 'dealin',
                            round: 6,
                            bonus: 0,
                            points: '3',
                            fu: '40',
                            dora: '1',
                            eastDelta: 5200,
                            southDelta: 0,
                            westDelta: -5200,
                            northDelta: 0,
                            riichiLog: { east: true, south: false, west: false, north: false }
                        },
                        {
                            handType: 'dealin',
                            round: 7,
                            bonus: 0,
                            points: '5',
                            fu: '30',
                            dora: '3',
                            eastDelta: -13000,
                            southDelta: -1000,
                            westDelta: 14000,
                            northDelta: 0,
                            riichiLog: { east: true, south: true, west: true, north: false }
                        }
                    ]
                },
                {
                    _id: 'tMuRud6vZrKzDZuGx',
                    timestamp: 1674691440053,
                    east_player: 'Yoimiya#1',
                    south_player: 'Aviation Expert',
                    west_player: 'iForgot',
                    north_player: 'falseriichitsumo',
                    east_score: 32100,
                    south_score: 33300,
                    west_score: 26000,
                    north_score: 8600,
                    east_elo_after_game: 1539.3031032305953,
                    south_elo_after_game: 1551.4547034931454,
                    west_elo_after_game: 1495.1303494819292,
                    north_elo_after_game: 1511.3583464012906,
                    all_hands_after_game: [
                        {
                            handType: 'nowin',
                            round: 1,
                            bonus: 0,
                            points: 0,
                            fu: 0,
                            dora: 0,
                            eastDelta: -1000,
                            southDelta: -1000,
                            westDelta: -1000,
                            northDelta: 3000,
                            riichiLog: { east: false, south: false, west: false, north: false }
                        },
                        {
                            handType: 'nowin',
                            round: 2,
                            bonus: 1,
                            points: 0,
                            fu: 0,
                            dora: 0,
                            eastDelta: 500,
                            southDelta: 1500,
                            westDelta: -1500,
                            northDelta: -1500,
                            riichiLog: { east: true, south: false, west: false, north: false }
                        },
                        {
                            handType: 'dealin',
                            round: 2,
                            bonus: 2,
                            points: '4',
                            fu: '40',
                            dora: '1',
                            eastDelta: 0,
                            southDelta: 13600,
                            westDelta: 0,
                            northDelta: -12600,
                            riichiLog: { east: false, south: true, west: false, north: false }
                        },
                        {
                            handType: 'dealin',
                            round: 2,
                            bonus: 3,
                            points: '5',
                            fu: 0,
                            dora: 0,
                            eastDelta: 0,
                            southDelta: -8900,
                            westDelta: 0,
                            northDelta: 8900,
                            riichiLog: { east: false, south: false, west: false, north: false }
                        },
                        {
                            handType: 'dealin',
                            round: 3,
                            bonus: 0,
                            points: '3',
                            fu: '40',
                            dora: '2',
                            eastDelta: 6200,
                            southDelta: 0,
                            westDelta: 0,
                            northDelta: -6200,
                            riichiLog: { east: false, south: false, west: false, north: true }
                        },
                        {
                            handType: 'selfdraw',
                            round: 4,
                            bonus: 0,
                            points: '2',
                            fu: '30',
                            dora: '1',
                            eastDelta: -500,
                            southDelta: 2000,
                            westDelta: -500,
                            northDelta: -1000,
                            riichiLog: { east: false, south: false, west: false, north: false }
                        },
                        {
                            handType: 'selfdraw',
                            round: 5,
                            bonus: 0,
                            points: '6',
                            fu: 0,
                            dora: '3',
                            eastDelta: -6000,
                            southDelta: -3000,
                            westDelta: 12000,
                            northDelta: -3000,
                            riichiLog: { east: false, south: false, west: true, north: false }
                        },
                        {
                            handType: 'selfdraw',
                            round: 6,
                            bonus: 0,
                            points: '4',
                            fu: '30',
                            dora: '1',
                            eastDelta: 7900,
                            southDelta: -3900,
                            westDelta: -2000,
                            northDelta: -2000,
                            riichiLog: { east: true, south: false, west: false, north: false }
                        },
                        {
                            handType: 'selfdraw',
                            round: 7,
                            bonus: 0,
                            points: '5',
                            fu: '20',
                            dora: '2',
                            eastDelta: -2000,
                            southDelta: 8000,
                            westDelta: -4000,
                            northDelta: -2000,
                            riichiLog: { east: false, south: true, west: false, north: false }
                        },
                        {
                            handType: 'dealin',
                            round: 8,
                            bonus: 0,
                            points: '2',
                            fu: '30',
                            dora: '1',
                            eastDelta: 2000,
                            southDelta: 0,
                            westDelta: -2000,
                            northDelta: 0,
                            riichiLog: { east: false, south: false, west: false, north: false }
                        }
                    ]
                },
                {
                    _id: 'iNPsmCmfQNvwDyinx',
                    timestamp: 1674784188681,
                    east_player: 'Ferbs',
                    south_player: 'iForgot',
                    west_player: 'Tobi',
                    north_player: '11',
                    east_score: 25400,
                    south_score: 34500,
                    west_score: -3400,
                    north_score: 43500,
                    east_elo_after_game: 1487.4635064718907,
                    south_elo_after_game: 1504.9698598016541,
                    west_elo_after_game: 1350.9943948643502,
                    north_elo_after_game: 1504.746977604465,
                    all_hands_after_game: [
                        {
                            handType: 'dealin',
                            round: 1,
                            bonus: 0,
                            points: '2',
                            fu: '30',
                            dora: '0',
                            eastDelta: 2900,
                            southDelta: -2900,
                            westDelta: 0,
                            northDelta: 0,
                            riichiLog: { east: true, south: false, west: false, north: false }
                        },
                        {
                            handType: 'dealin',
                            round: 1,
                            bonus: 1,
                            points: '1',
                            fu: '30',
                            dora: '0',
                            eastDelta: 0,
                            southDelta: -1300,
                            westDelta: 0,
                            northDelta: 1300,
                            riichiLog: { east: false, south: false, west: false, north: false }
                        },
                        {
                            handType: 'dealin',
                            round: 2,
                            bonus: 0,
                            points: '1',
                            fu: '40',
                            dora: '0',
                            eastDelta: 0,
                            southDelta: 0,
                            westDelta: 1300,
                            northDelta: -1300,
                            riichiLog: { east: false, south: false, west: false, north: false }
                        },
                        {
                            handType: 'dealin',
                            round: 3,
                            bonus: 0,
                            points: '1',
                            fu: '40',
                            dora: '0',
                            eastDelta: 1300,
                            southDelta: -1300,
                            westDelta: 0,
                            northDelta: 0,
                            riichiLog: { east: true, south: false, west: false, north: false }
                        },
                        {
                            handType: 'dealin',
                            round: 4,
                            bonus: 0,
                            points: '3',
                            fu: '40',
                            dora: '1',
                            eastDelta: 0,
                            southDelta: 0,
                            westDelta: -7700,
                            northDelta: 7700,
                            riichiLog: { east: false, south: false, west: false, north: true }
                        },
                        {
                            handType: 'dealin',
                            round: 4,
                            bonus: 1,
                            points: '5',
                            fu: '40',
                            dora: '1',
                            eastDelta: 8300,
                            southDelta: 0,
                            westDelta: 0,
                            northDelta: -8300,
                            riichiLog: { east: true, south: false, west: false, north: false }
                        },
                        {
                            handType: 'selfdraw',
                            round: 5,
                            bonus: 0,
                            points: '5',
                            fu: '30',
                            dora: '3',
                            eastDelta: -4000,
                            southDelta: -2000,
                            westDelta: -2000,
                            northDelta: 8000,
                            riichiLog: { east: false, south: false, west: false, north: true }
                        },
                        {
                            handType: 'dealin',
                            round: 6,
                            bonus: 0,
                            points: '2',
                            fu: '30',
                            dora: '0',
                            eastDelta: 0,
                            southDelta: 2900,
                            westDelta: 0,
                            northDelta: -2900,
                            riichiLog: { east: false, south: false, west: false, north: false }
                        },
                        {
                            handType: 'dealin',
                            round: 6,
                            bonus: 1,
                            points: '4',
                            fu: '30',
                            dora: '2',
                            eastDelta: 0,
                            southDelta: 11900,
                            westDelta: -11900,
                            northDelta: 0,
                            riichiLog: { east: false, south: false, west: false, north: false }
                        },
                        {
                            handType: 'selfdraw',
                            round: 6,
                            bonus: 2,
                            points: '3',
                            fu: '30',
                            dora: '1',
                            eastDelta: -3200,
                            southDelta: 7600,
                            westDelta: -2200,
                            northDelta: -2200,
                            riichiLog: { east: true, south: true, west: false, north: false }
                        },
                        {
                            handType: 'selfdraw',
                            round: 6,
                            bonus: 3,
                            points: '2',
                            fu: '30',
                            dora: '1',
                            eastDelta: -800,
                            southDelta: -1300,
                            westDelta: -1800,
                            northDelta: 3900,
                            riichiLog: { east: false, south: false, west: true, north: false }
                        },
                        {
                            handType: 'nowin',
                            round: 7,
                            bonus: 0,
                            points: 0,
                            fu: 0,
                            dora: 0,
                            eastDelta: 0,
                            southDelta: 0,
                            westDelta: 0,
                            northDelta: 0,
                            riichiLog: { east: false, south: false, west: false, north: false }
                        },
                        {
                            handType: 'selfdraw',
                            round: 8,
                            bonus: 1,
                            points: '5',
                            fu: '40',
                            dora: '1',
                            eastDelta: -4100,
                            southDelta: -4100,
                            westDelta: -4100,
                            northDelta: 12300,
                            riichiLog: { east: false, south: false, west: false, north: false }
                        }
                    ]
                },
                {
                    _id: 'RepHMtsHFa27QQ7y6',
                    timestamp: 1674790142250,
                    east_player: 'NeptuneStorm',
                    south_player: '@danlxmc',
                    west_player: 'Tanyao Tanki Red',
                    north_player: 'iForgot',
                    east_score: 25300,
                    south_score: 44100,
                    west_score: -11800,
                    north_score: 42400,
                    east_elo_after_game: 1501.4782946242258,
                    south_elo_after_game: 1523.8828030277018,
                    west_elo_after_game: 1577.7327218574878,
                    north_elo_after_game: 1520.8940809329772,
                    all_hands_after_game: [
                        {
                            handType: 'dealin',
                            round: 1,
                            bonus: 0,
                            points: '3',
                            fu: '30',
                            dora: '2',
                            eastDelta: 6800,
                            southDelta: 0,
                            westDelta: -5800,
                            northDelta: -1000,
                            riichiLog: { east: false, south: false, west: false, north: true }
                        },
                        {
                            handType: 'selfdraw',
                            round: 1,
                            bonus: 1,
                            points: '7',
                            fu: 0,
                            dora: '1',
                            eastDelta: -6100,
                            southDelta: -3100,
                            westDelta: -3100,
                            northDelta: 12300,
                            riichiLog: { east: false, south: false, west: false, north: false }
                        },
                        {
                            handType: 'selfdraw',
                            round: 2,
                            bonus: 0,
                            points: '1',
                            fu: '30',
                            dora: '0',
                            eastDelta: 2100,
                            southDelta: -500,
                            westDelta: -300,
                            northDelta: -1300,
                            riichiLog: { east: false, south: false, west: false, north: true }
                        },
                        {
                            handType: 'nowin',
                            round: 3,
                            bonus: 0,
                            points: 0,
                            fu: 0,
                            dora: 0,
                            eastDelta: -1500,
                            southDelta: 1500,
                            westDelta: 500,
                            northDelta: -1500,
                            riichiLog: { east: false, south: false, west: true, north: false }
                        },
                        {
                            handType: 'restart',
                            round: 3,
                            bonus: 1,
                            points: 0,
                            fu: 0,
                            dora: 0,
                            eastDelta: 0,
                            southDelta: 0,
                            westDelta: 0,
                            northDelta: 0,
                            riichiLog: { east: false, south: false, west: false, north: false }
                        },
                        {
                            handType: 'nowin',
                            round: 3,
                            bonus: 2,
                            points: 0,
                            fu: 0,
                            dora: 0,
                            eastDelta: -1500,
                            southDelta: 1500,
                            westDelta: 1500,
                            northDelta: -1500,
                            riichiLog: { east: false, south: false, west: false, north: false }
                        },
                        {
                            handType: 'dealin',
                            round: 3,
                            bonus: 3,
                            points: '4',
                            fu: '40',
                            dora: '0',
                            eastDelta: 0,
                            southDelta: 0,
                            westDelta: -8900,
                            northDelta: 9900,
                            riichiLog: { east: false, south: false, west: false, north: true }
                        },
                        {
                            handType: 'selfdraw',
                            round: 4,
                            bonus: 0,
                            points: '2',
                            fu: '30',
                            dora: '1',
                            eastDelta: -1000,
                            southDelta: -1000,
                            westDelta: -1000,
                            northDelta: 3000,
                            riichiLog: { east: false, south: false, west: false, north: false }
                        },
                        {
                            handType: 'selfdraw',
                            round: 4,
                            bonus: 1,
                            points: '1',
                            fu: '30',
                            dora: '0',
                            eastDelta: -400,
                            southDelta: -400,
                            westDelta: 1400,
                            northDelta: -600,
                            riichiLog: { east: false, south: false, west: false, north: false }
                        },
                        {
                            handType: 'selfdraw',
                            round: 5,
                            bonus: 0,
                            points: '3',
                            fu: '30',
                            dora: '1',
                            eastDelta: 6000,
                            southDelta: -2000,
                            westDelta: -2000,
                            northDelta: -2000,
                            riichiLog: { east: true, south: false, west: false, north: false }
                        },
                        {
                            handType: 'dealin',
                            round: 5,
                            bonus: 1,
                            points: '3',
                            fu: '30',
                            dora: '2',
                            eastDelta: 0,
                            southDelta: -4200,
                            westDelta: 0,
                            northDelta: 4200,
                            riichiLog: { east: false, south: false, west: false, north: false }
                        },
                        {
                            handType: 'dealin',
                            round: 6,
                            bonus: 0,
                            points: '1',
                            fu: '50',
                            dora: '0',
                            eastDelta: 0,
                            southDelta: 2400,
                            westDelta: -2400,
                            northDelta: 0,
                            riichiLog: { east: false, south: false, west: false, north: false }
                        },
                        {
                            handType: 'selfdraw',
                            round: 6,
                            bonus: 1,
                            points: '5',
                            fu: 0,
                            dora: '1',
                            eastDelta: -4100,
                            southDelta: 12300,
                            westDelta: -4100,
                            northDelta: -4100,
                            riichiLog: { east: false, south: true, west: false, north: false }
                        },
                        {
                            handType: 'dealin',
                            round: 6,
                            bonus: 2,
                            points: '5',
                            fu: 0,
                            dora: '4',
                            eastDelta: 0,
                            southDelta: 12600,
                            westDelta: -12600,
                            northDelta: 0,
                            riichiLog: { east: false, south: false, west: false, north: false }
                        }
                    ]
                }
            ]
        ;
        return this.calccool(japaneseLeagueName,played_games);
        let games = 0;
        let total_hands = 0;
        let deal_in_hands = 0;
        let deal_in_total = 0;
        for (let i in played_games) {
            games++;
            console.log("games: " + games);
            let game = played_games[i]
            let hands = game.all_hands_after_game;
            for (let j in hands) {
                const hand = hands[j];
                total_hands++;
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
                    if (eastDeltaTemp < 0 && game.east_player === japaneseLeagueName) {
                        deal_in_hands++;
                        deal_in_total += eastDeltaTemp;
                    } else if (southDeltaTemp < 0 && game.south_player === japaneseLeagueName) {
                        deal_in_hands++;
                        deal_in_total += southDeltaTemp;
                    } else if (westDeltaTemp < 0 && game.west_player === japaneseLeagueName) {
                        deal_in_hands++;
                        deal_in_total += westDeltaTemp;
                    } else if (northDeltaTemp < 0 && game.north_player === japaneseLeagueName) {
                        deal_in_hands++;
                        deal_in_total += northDeltaTemp;
                    }
                }
            }
            let hands2 = game.all_hands;
            for (let k in hands2) {
                let hand = hands2[k];
                total_hands++;
                if (hand.handType === Constants.DEAL_IN) {
                    if (hand.eastDelta < -1000 && game.east_player === japaneseLeagueName) {
                        deal_in_hands++;
                        deal_in_total += hand.eastDelta;
                    } else if (hand.southDelta < -1000 && game.south_player === japaneseLeagueName) {
                        deal_in_hands++;
                        deal_in_total += hand.southDelta;
                    } else if (hand.westDelta < -1000 && game.west_player === japaneseLeagueName) {
                        deal_in_hands++;
                        deal_in_total += hand.westDelta;
                    } else if (hand.northDelta < -1000 && game.north_player === japaneseLeagueName) {
                        deal_in_hands++;
                        deal_in_total += hand.northDelta;
                    }
                }
            }
            console.log(total_hands);
            console.log(deal_in_hands);
            console.log(deal_in_total);
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
    },

    calccool(japaneseLeagueName,played_games) {
        let games = 0;
        let total_hands = 0;
        let win_hands = 0;
        let win_points = 0;

        let self_draw_total = 0;
        for (let i in played_games) {
            games++;
            console.log("games: " + games);
            let game = played_games[i]
            let hands = game.all_hands_after_game;
            for (let j in hands) {
                const hand = hands[j];
                total_hands++;
                let riichiHistory = hand.riichiLog;
                let eastDeltaTemp = Number(hand.eastDelta);
                let southDeltaTemp = Number(hand.southDelta);
                let westDeltaTemp = Number(hand.westDelta);
                let northDeltaTemp = Number(hand.northDelta);
                if (hand.handType === Constants.SELF_DRAW) {
                    if (eastDeltaTemp > 0 && game.east_player === japaneseLeagueName) {
                        self_draw_total++;
                    } else if (southDeltaTemp > 0 && game.south_player === japaneseLeagueName) {
                        self_draw_total++;
                    } else if (westDeltaTemp > 0 && game.west_player === japaneseLeagueName) {
                        self_draw_total++;
                    } else if (northDeltaTemp > 0 && game.north_player === japaneseLeagueName) {
                        self_draw_total++;
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
                    if (eastDeltaTemp > 0 && game.east_player === japaneseLeagueName) {
                        win_hands++;
                        win_points += eastDeltaTemp;
                    } else if (southDeltaTemp > 0 && game.south_player === japaneseLeagueName) {
                        win_hands++;
                        win_points += southDeltaTemp;
                    } else if (westDeltaTemp > 0 && game.west_player === japaneseLeagueName) {
                        win_hands++;
                        win_points += westDeltaTemp;
                    } else if (northDeltaTemp > 0 && game.north_player === japaneseLeagueName) {
                        win_hands++;
                        win_points += northDeltaTemp;
                    }
                }
            }
            let hands2 = game.all_hands;
            for (let k in hands2) {
                let hand = hands2[k];
                total_hands++;
                if (hand.handType === Constants.DEAL_IN || hand.handType === Constants.SELF_DRAW) {
                    if (hand.eastDelta > 0 && game.east_player === japaneseLeagueName) {
                        win_hands++;
                        win_points += hand.eastDelta;
                    } else if (hand.southDelta > 0 && game.south_player === japaneseLeagueName) {
                        win_hands++;
                        win_points += hand.southDelta;
                    } else if (hand.westDelta > 0 && game.west_player === japaneseLeagueName) {
                        win_hands++;
                        win_points += hand.westDelta;
                    } else if (hand.northDelta > 0 && game.north_player === japaneseLeagueName) {
                        win_hands++;
                        win_points += hand.northDelta;
                    }
                }
            }
            console.log(win_points);
            console.log(win_hands);
            console.log(self_draw_total);
        }
    }
}