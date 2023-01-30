import Players from '../../api/Players';
import './ComparisonStatistics.html';
import {HongKongHands, JapaneseHands, UpperJapaneseHands} from "../../api/GameDatabases";

Template.ComparisonStatistics.onCreated( function() {
    Session.set("ComparisonGameType","Riichi");
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
        return getComparisonHelper(Session.get("ComparisonPlayer1"),Session.get("ComparisonPlayer2"),Session.get("ComparisonGameType"))[0];
    },
    stats_names() {
        return getComparisonHelper(Session.get("ComparisonPlayer1"),Session.get("ComparisonPlayer2"),Session.get("ComparisonGameType"))[1];
    },
    stats_player_2() {
        return getComparisonHelper(Session.get("ComparisonPlayer1"),Session.get("ComparisonPlayer2"),Session.get("ComparisonGameType"))[2];
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
        document.getElementById("comparison_div").style.display = "block";
        getComparisonHelper(Session.get("ComparisonPlayer1"),Session.get("ComparisonPlayer2"),Session.get("ComparisonGameType"));
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
    if (data.length === 0) {
        return window.alert("There are no games between these two players!");
    }
    let result = [[],[],[]];
    for (let i in result) {
        result[i].push(getAveragePlacement(data,player1, player2)[i]);
    }
    return result;
}

function getAveragePlacement(data,player1,player2) {
    return;//data.map(game => )
}

function getPlacementOfGame(game, player) {
    return;
}