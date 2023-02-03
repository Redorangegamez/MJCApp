import Players from '../../api/Players';
import './ComparisonStatistics.html';
import {HongKongHands, JapaneseHands, UpperJapaneseHands} from "../../api/GameDatabases";
import Constants from '../../api/Constants';

Template.ComparisonStatistics.onCreated( function() {
    Session.set("ComparisonGameType","Riichi");
    Session.set("StartComparison", false);
    this.stats = new ReactiveArray();
    this.stats.push({stats:1},{stats:2},{stats:3});
    console.log(Template.instance().stats.get());
});

// GUI helpers for hand submission template
Template.ComparisonStatistics.helpers({
    // Choose player to select from dropdown menus
    players() {
        let playerNames = [];
        if (Session.get("ComparisonGameType") === "Riichi"){
            Players.find({japaneseGamesPlayed:{$gt:0}}).forEach((val) => {
                playerNames.push({LeagueName: val.japaneseLeagueName});
            });
        } else if (Session.get("ComparisonGameType") === "Upper League") {
            Players.find({upperJapaneseGamesPlayed:{$gt:0}}).forEach((val) => {
                playerNames.push({LeagueName: val.japaneseLeagueName});
            });
        } else if (Session.get("ComparisonGameType") === "Hong Kong") {
            Players.find({hongKongGamesPlayed:{$gt:0}}).forEach((val) => {
                playerNames.push({LeagueName: val.hongKongLeagueName});
            });
        }
        playerNames.sort((a, b) => {
            return a.LeagueName.toLowerCase().localeCompare(b.LeagueName.toLowerCase());
        });
        return playerNames;
    },

    stats_player_1() {
        return Template.instance().stats.get();
    },
    stats_names() {
        return Template.instance().stats.get();
    },
    stats_player_2() {
        return Template.instance().stats.get();
    }
});

Template.ComparisonStatistics.events({
    'change select[name="comparison_type"]'(event) {
        Session.set("ComparisonGameType", event.target.value);
    },
    'change select[name="comparison_player1"]'(event) {
        Session.set("ComparisonPlayer1", event.target.value);
    },
    'change select[name="comparison_player2"]'(event) {
        Session.set("ComparisonPlayer2", event.target.value);
    },
    'click .get_comparison_button'(event) {
        $("comparison_div").style.display = "block";
        let player1 = Session.get("ComparisonPlayer1");
        let player2 = Session.get("ComparisonPlayer2")
        let gameType = Session.get("ComparisonGameType")
        let games;
        if (gameType === "Riichi") {
            games = JapaneseHands.find(
                {$and:
                        [{ $or: [{ east_player: player1},
                                { south_player: player1},
                                { west_player: player1},
                                { north_player: player1}] },
                            { $or: [{ east_player: player2},
                                    { south_player: player2},
                                    { west_player: player2},
                                    { north_player: player2}] },
                            {east_elo_after_game: {$exists:true}}
                        ]} );
        } else if (gameType === "Upper League") {
            games = UpperJapaneseHands.find(
                {$and:
                        [{ $or: [{ east_player: player1},
                                { south_player: player1},
                                { west_player: player1},
                                { north_player: player1}] },
                            { $or: [{ east_player: player2},
                                    { south_player: player2},
                                    { west_player: player2},
                                    { north_player: player2}] },
                            {east_elo_after_game: {$exists:true}}
                        ]} );
        } else {
            games = HongKongHands.find(
                {$and:
                        [{ $or: [{ east_player: player1},
                                { south_player: player1},
                                { west_player: player1},
                                { north_player: player1}] },
                            { $or: [{ east_player: player2},
                                    { south_player: player2},
                                    { west_player: player2},
                                    { north_player: player2}] }
                        ]});
        }

        const data = [];
        games.forEach(game => data.push(game));
        console.log(data);
        if (data.length === 0) {
            return window.alert("There are no games between these two players!");
        } else {
            Session.set("StartComparison", true);
        }
    }
});

function getComparisonHelper(player1, player2, gameType) {
    let games;
    if (gameType === "Riichi") {
        games = JapaneseHands.find(
            {$and:
                    [{ $or: [{ east_player: player1},
                            { south_player: player1},
                            { west_player: player1},
                            { north_player: player1}] },
                        { $or: [{ east_player: player2},
                                { south_player: player2},
                                { west_player: player2},
                                { north_player: player2}] },
                        {east_elo_after_game: {$exists:true}}
                    ]} );
    } else if (gameType === "Upper League") {
        games = UpperJapaneseHands.find(
            {$and:
                    [{ $or: [{ east_player: player1},
                            { south_player: player1},
                            { west_player: player1},
                            { north_player: player1}] },
                        { $or: [{ east_player: player2},
                                { south_player: player2},
                                { west_player: player2},
                                { north_player: player2}] },
                        {east_elo_after_game: {$exists:true}}
                    ]} );
    } else {
        games = HongKongHands.find(
            {$and:
                    [{ $or: [{ east_player: player1},
                            { south_player: player1},
                            { west_player: player1},
                            { north_player: player1}] },
                        { $or: [{ east_player: player2},
                                { south_player: player2},
                                { west_player: player2},
                                { north_player: player2}] }
                    ]});
    }

    const data = [];
    games.forEach(game => data.push(game));
    let placements1 = data.map(game => getPlacementOfGame(game, player1));
    let placements2 = data.map(game => getPlacementOfGame(game, player2));

    let result = [[],[],[]];
    for (let i in result) {
        result[i].push(getAveragePlacement(data,player1, player2)[i]);
    }
    return result;
}

function getAveragePlacement(data,player1,player2) {
    return [getPlacementOfGame(data[0], player1),9,9];
}

function getPlacementOfGame(game, player) {
    let scores = [{east_player, score: game.east_score},
        {south_player, score: game.south_score},
        {west_player, score: game.west_score},
        {north_player, score: game.north_score}];
    scores.sort((a, b) => b.score - a.score)
    console.log()
    let playerIndex;
    if (player === game.east_player ) {
        playerIndex = 0;
    } else if (player === game.south_player ) {
        playerIndex = 1;
    } else if (player === game.north_player ) {
        playerIndex = 2;
    } else {
        playerIndex = 3;
    }
    let placement = 1;
    for (let i in scores) {
        if (i != playerIndex) {
            if (scores[i] >= scores[i]) {
                placement += 1
            }
        }
    }
    return placement;
}