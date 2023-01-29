import Players from '../../api/Players';
import './EloGraph.html';
import EloChart from './EloChart';

let current_chart;

Template.EloGraph.onCreated( function() {
    Session.set("EloGameType","Riichi");
    Session.set("ExistChart", false);
});

// GUI helpers for hand submission template
Template.EloGraph.helpers({
    // Choose player to select from dropdown menus
    players() {
        let playerNames = [];
        if (Session.get("EloGameType") === "Riichi"){
            Players.find({japaneseGamesPlayed:{$gt:0}}).forEach((val) => {
                playerNames.push({LeagueName: val.japaneseLeagueName});
            });
        } else if (Session.get("EloGameType") === "Upper League") {
            Players.find({upperJapaneseGamesPlayed:{$gt:0}}).forEach((val) => {
                playerNames.push({LeagueName: val.japaneseLeagueName});
            });
        } else if (Session.get("EloGameType") === "Hong Kong") {
            Players.find({hongKongGamesPlayed:{$gt:0}}).forEach((val) => {
                playerNames.push({LeagueName: val.hongKongLeagueName});
            });
        }
        playerNames.sort((a, b) => {
            return a.LeagueName.toLowerCase().localeCompare(b.LeagueName.toLowerCase());
        });
        return playerNames;
    }
});

Template.EloGraph.events({
    'change select[name="elo_type"]'(event) {
        Session.set("EloGameType", event.target.value);
    },
    'change select[name="elo_player"]'(event) {
        Session.set("EloPlayer", event.target.value);
    },
    'click .get_elo_button'(event) {
        let canvas = document.getElementById("eloChart");
        let eloChart = new EloChart(Session.get("EloPlayer"), Session.get("EloGameType"), canvas);
        if (current_chart !== undefined) {
            current_chart.destroy();
        }
        current_chart = eloChart.getChart();
    }
});