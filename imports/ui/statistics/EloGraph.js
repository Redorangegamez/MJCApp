import Players from '../../api/Players';
import './EloGraph.html';
import EloChart from './EloChart';
import Constants from "../../api/Constants";

Template.EloGraph.onCreated( function() {
    Session.set("EloGameType","Riichi");

});

// GUI helpers for hand submission template
Template.EloGraph.helpers({
    // Choose player to select from dropdown menus
    players() {
        let playerNames = [];
        if (Session.get("EloGameType") === "Riichi") {
            Players.find({upperJapanese: {$eq: true}}).forEach((val) => {
                playerNames.push({japaneseLeagueName: val.japaneseLeagueName});
            });
        } else if (Session.get("EloGameType") === "Upper League") {
            Players.find({}).forEach((val) => {
                playerNames.push({japaneseLeagueName: val.japaneseLeagueName});
            });
        } else {
            Players.find({}).forEach((val) => {
                playerNames.push({hongKongLeagueName: val.hongKongLeagueName});
            });
            playerNames.sort((a, b) => {
                return a.hongKongLeagueName.toLowerCase().localeCompare(b.hongKongLeagueName.toLowerCase());
            });
            return playerNames;
        }
        playerNames.sort((a, b) => {
            return a.japaneseLeagueName.toLowerCase().localeCompare(b.japaneseLeagueName.toLowerCase());
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
        let eloChart = new EloChart(Session.get("EloPlayer"), Session.get("EloGameType"));
        eloChart.getChart();
    }
});