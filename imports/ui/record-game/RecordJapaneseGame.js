//Databases
import Players from '../../api/Players';
import { JapaneseHands } from '../../api/GameDatabases';
import { UpperJapaneseHands } from '../../api/GameDatabases';

import Constants from '../../api/Constants';
import EloCalculator from '../../api/EloCalculator';
import GameRecordUtils from '../../api/utils/GameRecordUtils';
import { HandScoreCalculator } from '../../api/HandScoreCalculator';

import './RecordJapaneseGame.html';
import RecalculateStatistics from "../statistics/RecalculateStatistics";

// Code to be evaluated when RecordJapaneseGame template is reloaded
Template.RecordJapaneseGame.onCreated( function() {
    // Meteor: Template type to show for choosing hand submission
    this.hand_type = new ReactiveVar( Constants.JPN_DEAL_IN );

    // Meteor: List of hands submitted to display
    this.hands = new ReactiveArray();

    // Save game riichi history for if a hand is deleted
    this.riichi_round_history = [];
    this.riichi_sum_history = [];

    // Reset shared Mahjong stats
    GameRecordUtils.resetGameValues(Constants.JPN_START_POINTS);

    // Reset Japanese hand specific stats
    Session.set("current_fu", 0);
    Session.set("current_dora", 0);

    // Reset GUI selection fields
    setAllGUIRiichisFalse();

    // Reset Japanese game specific stats
    Session.set("east_riichi_sum", 0);
    Session.set("south_riichi_sum", 0);
    Session.set("west_riichi_sum", 0);
    Session.set("north_riichi_sum", 0);

    Session.set("eastPlayerRiichisWon", 0);
    Session.set("southPlayerRiichisWon", 0);
    Session.set("westPlayerRiichisWon", 0);
    Session.set("northPlayerRiichisWon", 0);

    Session.set("eastPlayerDoraSum", 0);
    Session.set("southPlayerDoraSum", 0);
    Session.set("westPlayerDoraSum", 0);
    Session.set("northPlayerDoraSum", 0);

    Session.set("eastPlayerDealInTotal", 0);
    Session.set("southPlayerDealInTotal", 0);
    Session.set("westPlayerDealInTotal", 0);
    Session.set("northPlayerDealInTotal", 0);

    Session.set("eastPlayerDealInAfterRiichiTotal", 0);
    Session.set("southPlayerDealInAfterRiichiTotal", 0);
    Session.set("westPlayerDealInAfterRiichiTotal", 0);
    Session.set("northPlayerDealInAfterRiichiTotal", 0);

    Session.set("eastPlayerSelfDrawTotal", 0);
    Session.set("southPlayerSelfDrawTotal", 0);
    Session.set("westPlayerSelfDrawTotal", 0);
    Session.set("northPlayerSelfDrawTotal", 0);

    Session.set("eastPlayerRiichiEV", 0);
    Session.set("southPlayerRiichiEV", 0);
    Session.set("westPlayerRiichiEV", 0);
    Session.set("northPlayerRiichiEV", 0);

    // Reset number of riichi sticks stored for next player win
    Session.set("free_riichi_sticks", 0);
});

// Code to be evaluated when jpn_dealin template is reloaded
Template.jpn_dealin.onCreated( function() {
    // Reset GUI selection fields
    setAllGUIRiichisFalse();
});

// Code to be evaluated when jpn_selfdraw template is reloaded
Template.jpn_selfdraw.onCreated( function() {
    // Reset GUI selection fields
    setAllGUIRiichisFalse();
});

// Code to be evaluated when jpn_nowin tenplate is reloaded
Template.jpn_nowin.onCreated( function() {
    // Reset GUI selection fields
    Session.set("east_tenpai", false);
    Session.set("south_tenpai", false);
    Session.set("west_tenpai", false);
    Session.set("north_tenpai", false);

    setAllGUIRiichisFalse();
});

// Code to be evaluated when jpn_restart tenplate is reloaded
Template.jpn_restart.onCreated( function() {
    // Reset GUI selection fields
    setAllGUIRiichisFalse();
});

// Code to be evaluated when jpn_dealin_pao tenplate is reloaded
Template.jpn_dealin_pao.onCreated( function() {
    // Reset GUI selection fields
    setAllGUIRiichisFalse();
});

// GUI helpers for hand submission template
Template.RecordJapaneseGame.helpers({
    // Choose hand type for submission form
    hand_type() {
        return Template.instance().hand_type.get();
    },
    // Choose player to select from dropdown menus
    players() {
        let playerNames = [];
        if (Session.get("upperJapaneseGame")) {
            Players.find({upperJapanese: {$eq: true}}).forEach((val) => {
                playerNames.push({japaneseLeagueName: val.japaneseLeagueName});
            });
        } else {
            Players.find({}).forEach((val) => {
                playerNames.push({japaneseLeagueName: val.japaneseLeagueName});
            });
        }
        playerNames.sort((a, b) => {
            return a.japaneseLeagueName.toLowerCase().localeCompare(b.japaneseLeagueName.toLowerCase());
        });
        return playerNames;
    },
    // Return all recorded hands for a game as an array
    hands() {
        return Template.instance().hands.get();
    },
    // Show what a player's +/- is
    get_player_delta(direction) {
        return (GameRecordUtils.getDirectionScore(direction) - Constants.JPN_START_POINTS);
    },
    // Show what a player's current score is
    get_player_score(direction) {
        return GameRecordUtils.getDirectionScore(direction);
    },
    // Show what a player's score will look like if game is ended now
    get_player_score_final(direction) {
        let retval = GameRecordUtils.getDirectionScore(direction);

        const winScore = Math.max(Number(Session.get("east_score")),
                                Number(Session.get("south_score")),
                                Number(Session.get("west_score")),
                                Number(Session.get("north_score")));

        if (winScore === Session.get("east_score")) {
            if (direction === Constants.EAST)
                retval += Constants.JPN_RIICHI_POINTS * Number(Session.get("free_riichi_sticks"));
        } else if (winScore === Session.get("south_score")) {
            if (direction === Constants.SOUTH)
                retval += Constants.JPN_RIICHI_POINTS * Number(Session.get("free_riichi_sticks"));
        } else if (winScore === Session.get("west_score")) {
            if (direction === Constants.WEST)
                retval += Constants.JPN_RIICHI_POINTS * Number(Session.get("free_riichi_sticks"));
        } else if (winScore === Session.get("north_score")) {
            if (direction === Constants.NORTH)
                retval += Constants.JPN_RIICHI_POINTS * Number(Session.get("free_riichi_sticks"));
        }


        return retval;
    },
    // Show what a player's Elo change will look like if game is ended now
    get_expected_elo_change(direction) {

        let eastPlayer  = Session.get("current_east");
        let southPlayer = Session.get("current_south");
        let westPlayer  = Session.get("current_west");
        let northPlayer = Session.get("current_north");

        if (eastPlayer  === Constants.DEFAULT_EAST ||
            southPlayer === Constants.DEFAULT_SOUTH ||
            westPlayer  === Constants.DEFAULT_WEST ||
            northPlayer === Constants.DEFAULT_NORTH) {
            return "N/A";
        }

        let game = {
            timestamp: Date.now(),
            east_player: eastPlayer,
            south_player: southPlayer,
            west_player: westPlayer,
            north_player: northPlayer,
            east_score: (Number(Session.get("east_score"))),
            south_score: (Number(Session.get("south_score"))),
            west_score: (Number(Session.get("west_score"))),
            north_score: (Number(Session.get("north_score"))),
            all_hands: Template.instance().hands.get(),
        };

        let jpnEloCalculator = new EloCalculator(Constants.ELO_CALCULATOR_N,
                                                 Constants.ELO_CALCULATOR_EXP,
                                                 Constants.JPN_SCORE_ADJUSTMENT,
                                                 game,
                                                 Constants.GAME_TYPE.JAPANESE);

        switch (direction) {
            case Constants.EAST:  return jpnEloCalculator.eloChange(eastPlayer).toFixed(2);
            case Constants.SOUTH: return jpnEloCalculator.eloChange(southPlayer).toFixed(2);
            case Constants.WEST:  return jpnEloCalculator.eloChange(westPlayer).toFixed(2);
            case Constants.NORTH: return jpnEloCalculator.eloChange(northPlayer).toFixed(2);
        };
    },
    // Show what a player's Elo change will look like if game is ended now
    upper_get_expected_elo_change(direction) {

        let eastPlayer  = Session.get("current_east");
        let southPlayer = Session.get("current_south");
        let westPlayer  = Session.get("current_west");
        let northPlayer = Session.get("current_north");

        if (eastPlayer  === Constants.DEFAULT_EAST ||
            southPlayer === Constants.DEFAULT_SOUTH ||
            westPlayer  === Constants.DEFAULT_WEST ||
            northPlayer === Constants.DEFAULT_NORTH) {
            return "N/A";
        }

        let game = {
            timestamp: Date.now(),
            east_player: eastPlayer,
            south_player: southPlayer,
            west_player: westPlayer,
            north_player: northPlayer,
            east_score: (Number(Session.get("east_score"))),
            south_score: (Number(Session.get("south_score"))),
            west_score: (Number(Session.get("west_score"))),
            north_score: (Number(Session.get("north_score"))),
            all_hands: Template.instance().hands.get(),
        };

        let jpnEloCalculator = new EloCalculator(Constants.ELO_CALCULATOR_N,
            Constants.ELO_CALCULATOR_EXP,
            Constants.JPN_SCORE_ADJUSTMENT,
            game,
            Constants.GAME_TYPE.UPPER_JAPANESE);

        switch (direction) {
            case Constants.EAST:  return jpnEloCalculator.eloChange(eastPlayer).toFixed(2);
            case Constants.SOUTH: return jpnEloCalculator.eloChange(southPlayer).toFixed(2);
            case Constants.WEST:  return jpnEloCalculator.eloChange(westPlayer).toFixed(2);
            case Constants.NORTH: return jpnEloCalculator.eloChange(northPlayer).toFixed(2);
        };
    },
    // Show a player's ELO
    get_jpn_elo(player) {
        switch (player) {
        case Constants.DEFAULT_EAST:
        case Constants.DEFAULT_SOUTH:
        case Constants.DEFAULT_WEST:
        case Constants.DEFAULT_NORTH:
            return "?";
        default:
            return Players.findOne({japaneseLeagueName: player}).japaneseElo.toFixed(2);
        };
    },
    // Show a player's ELO
    get_upper_jpn_elo(player) {
        switch (player) {
            case Constants.DEFAULT_EAST:
            case Constants.DEFAULT_SOUTH:
            case Constants.DEFAULT_WEST:
            case Constants.DEFAULT_NORTH:
                return "?";
            default:
                return Players.findOne({japaneseLeagueName: player}).upperJapaneseElo.toFixed(2);
        };
    },
    // Return a string of the round wind for Japanese style
    displayRoundWind(round) {
        return GameRecordUtils.displayRoundWind(round, Constants.GAME_TYPE.JAPANESE);
    },
    // Return the current round number for Japanese style
    displayRoundNumber(round) {
        return GameRecordUtils.handNumberToRoundNumber(round,
                                                       Constants.GAME_TYPE.JAPANESE);
    },
});

// GUI helpers for rendering hands
Template.jpn_render_hand.helpers({
    // Boolean expressions to help with rendering hands
    is_dealin(hand_type) {
        return hand_type === Constants.DEAL_IN;
    },
    is_selfdraw(hand_type) {
        return hand_type === Constants.SELF_DRAW;
    },
    is_nowin(hand_type) {
        return hand_type === Constants.NO_WIN;
    },
    is_restart(hand_type) {
        return hand_type === Constants.RESTART;
    },
    is_mistake(hand_type) {
        return hand_type === Constants.MISTAKE;
    },
    is_pao(hand_type) {
        return hand_type === Constants.PAO;
    },
    // Return a string of the round wind for Japanese style
    displayRoundWind(round) {
        return GameRecordUtils.displayRoundWind(round, Constants.GAME_TYPE.JAPANESE);
    },
    // Return the current round number for Japanese style
    displayRoundNumber(round) {
        return GameRecordUtils.handNumberToRoundNumber(round,
                                                       Constants.GAME_TYPE.JAPANESE);
    },
})

// Helpers for point selection dropdown
Template.jpn_points.helpers({
    /**
     * Return an Array of valid Japanese mahjong hand point values
     * 13, 26, 39, 52, and 65 are considered single->quintuple yakumans
     *
     * @return {Array} An Array of valid point values with yakuman values
     */
    get possiblePoints() {
        let normalPoints = Array.from({ length: Constants.JPN_MAX_HAND_SIZE - 1 })
                                .map((_,i) => ({ point: i + 1}));
        let yakumanPoints = Array.from({ length: Constants.JPN_MAX_YAKUMAN_MULTIPLE })
                                 .map((_,i) => ({ point: (i + 1) * Constants.JPN_MAX_HAND_SIZE}));
        return normalPoints.concat(yakumanPoints);
    }
});

// Helpers for fu selection dropdown
Template.jpn_fu.helpers({
    /**
     * Return an Array of valid Japanese mahjong hand fu values
     *
     * @return {Array} An Array of valid fu values
     */
    get possibleFu() {
        let allowedFu = Array.from({length: 10}).map((_,i) => ({ fu: 20 + 10 * i }));
        allowedFu.push({ fu: 25});
        allowedFu.sort((a, b) => a.fu > b.fu);
        return allowedFu;
    }
});

// Helpers for dora selection dropdown
Template.jpn_dora.helpers({
    /**
     * Return an Array of valid Japanese mahjong hand dora values
     * Theoretically, maximum dora in one hand is 35
     *
     * @return {Array} An Array of valid dora values
     */
    get possibleDora() {
        return Array.from({length: 36}).map((_,i) => ({ dora: i }));
    }
});

// Functions for browser events
Template.RecordJapaneseGame.events({
    //Selecting who the east player is
    'change select[name="east_player"]'(event) {
        Session.set("current_east", event.target.value);
        const stat = new RecalculateStatistics(event.target.value);
        stat.calcDealInTotal();
        stat.calcWinTotal();
    },
    //Selecting who the south player is
    'change select[name="south_player"]'(event) {
        Session.set("current_south", event.target.value);
    },
    //Selecting who the west player is
    'change select[name="west_player"]'(event) {
        Session.set("current_west", event.target.value);
    },
    //Selecting who the north player is
    'change select[name="north_player"]'(event) {
        Session.set("current_north", event.target.value);
    },
    //Checking if Upper Ranked is checked
    'change input'(event) {
        if (event.target.checked) {
            document.getElementById("east_player_dropdown").selectedIndex = 0;
            document.getElementById("south_player_dropdown").selectedIndex = 0;
            document.getElementById("west_player_dropdown").selectedIndex = 0;
            document.getElementById("north_player_dropdown").selectedIndex = 0;
            $("#upperLeagueRow").toggle();
            $("#upper_elo").toggle();
            $("#regular_elo").hide();

        }

        if (!event.target.checked) {
            let r = confirm("Are you sure this is not an upper League game?");

            if (r != true) {
                return;
            }
            $("#upperLeagueRow").hide();
            $("#regular_elo").toggle();
            $("#upper_elo").hide();
        }
        Session.set("upperJapaneseGame", event.target.checked);
    },
    //Selecting who the winner is for a dealin or tsumo
    'click .winner'(event) {
        if ( !$( event.target ).hasClass( "disabled" )) {
            if ( $( event.target ).hasClass( "active" )) {
                $( event.target ).removeClass( "active" );
                $( ".winner_buttons button" ).not( event.target ).removeClass( "disabled" );
                Session.set("round_winner", Constants.NO_PERSON);
            } else {
                $( event.target ).addClass( "active" );
                $( ".winner_buttons button" ).not( event.target ).addClass( "disabled" );
                Session.set("round_winner", event.target.innerHTML);
            }
        }
    },
    //Selecting who the loser is for a dealin
    'click .loser'(event) {
        if ( !$( event.target ).hasClass( "disabled" )) {
            if ( $( event.target ).hasClass( "active" )) {
                $( event.target ).removeClass( "active" );
                $( ".loser_buttons button" ).not( event.target ).removeClass( "disabled" );
                Session.set("round_loser", Constants.NO_PERSON);
            } else {
                $( event.target ).addClass( "active" );
                $( ".loser_buttons button" ).not( event.target ).addClass( "disabled" );
                Session.set("round_loser", event.target.innerHTML);
            }
        }
    },
    //Selecting who riichied
    'click .riichi'(event) {
        if ( !$( event.target ).hasClass( "active" )) {
            $( event.target ).addClass( "active" );
            Session.set( GameRecordUtils.playerToDirection(event.target.innerHTML) + "_riichi", true);
        } else {
            $( event.target ).removeClass( "active" )
            Session.set( GameRecordUtils.playerToDirection(event.target.innerHTML) + "_riichi", false);
        }
    },
    //Selecting who tenpaied
    'click .tenpai'(event) {
        if ( !$( event.target ).hasClass( "active" )) {
            $( event.target ).addClass( "active" );
            Session.set( GameRecordUtils.playerToDirection(event.target.innerHTML) + "_tenpai", true);
        } else {
            $( event.target ).removeClass( "active" )
            Session.set( GameRecordUtils.playerToDirection(event.target.innerHTML) + "_tenpai", false);
        }
    },
    //Selecting who is under pao
    'click .pao'(event) {
        if ( !$( event.target ).hasClass( "disabled" )) {
            if ( $( event.target ).hasClass( "active" )) {
                $( event.target ).removeClass( "active" );
                $( ".pao_buttons button" ).not( event.target ).removeClass( "disabled" );
                Session.set("round_pao_player", Constants.NO_PERSON);
            } else {
                $( event.target ).addClass( "active" );
                $( ".pao_buttons button" ).not( event.target ).addClass( "disabled" );
                Session.set("round_pao_player", event.target.innerHTML);
            }
        }
    },
    //Submission of a hand
    'click .submit_hand_button'(event, template) {

        if ( !$( event.target ).hasClass( "disabled")) {

            const handType = template.hand_type.get();
            //Do nothing if we don't have players yet
            if (GameRecordUtils.allPlayersSelected()) {
                // Save what the free riichi stick number is in case we delete this hand
                template.riichi_sum_history.push(Session.get("free_riichi_sticks"));

                switch(handType) {
                    // Push a deal in hand and ensure proper information
                case Constants.JPN_DEAL_IN:
                    // Ensure correct input of who won and who lost
                    if (Session.get("round_winner") != Constants.NO_PERSON &&
                        Session.get("round_loser") != Constants.NO_PERSON &&
                        Session.get("round_winner") != Session.get("round_loser")) {

                        if (!Session.get("input_dora")) {
                            window.alert("Please submit dora count!");
                            return;
                        }
                        // Ensure a valid point/fu combination
                        if (GameRecordUtils.noIllegalJapaneseHands()) {
                            push_dealin_hand(template);
                            $( ".delete_hand_button" ).removeClass( "disabled" );
                            resetRoundStats();
                        }
                        else {
                            window.alert("Invalid points/fu entry!");
                        }
                    } else {
                        window.alert("You need to fill out who won and who dealt in!");
                    }
                    break;
                    // Push a self draw hand and ensure proper information
                case Constants.JPN_SELF_DRAW:
                    // Ensure correct input of who won
                    if (Session.get("round_winner") != Constants.NO_PERSON) {
                        if (!Session.get("input_dora")) {
                            window.alert("Please submit dora count!");
                            return;
                        }
                        // Ensure a valid point/fu combination
                        if (GameRecordUtils.noIllegalSelfdrawJapaneseHands()) {
                            push_selfdraw_hand(template);
                            $( ".delete_hand_button" ).removeClass( "disabled" );
                            resetRoundStats();
                        }
                        else {
                            window.alert("Invalid points/fu entry!");
                        }
                    } else {
                        window.alert("You need to fill out who self drew!");
                    }
                    break;
                    // Push a tenpai hand -> cannot input invalid information
                case Constants.JPN_NO_WIN:
                    push_nowin_hand(template);
                    $( ".delete_hand_button" ).removeClass( "disabled" );
                    resetRoundStats();
                    break;
                    // Push a restart hand -> cannot input invalid information
                case Constants.JPN_RESTART:
                    push_restart_hand(template);
                    $( ".delete_hand_button" ).removeClass( "disabled" );
                    resetRoundStats();
                    break;
                    // Push a chombo hand and ensure proper information
                case Constants.JPN_MISTAKE:
                    // Ensure correct input of who chomboed
                    if (Session.get("round_loser") != Constants.NO_PERSON) {
                        push_mistake_hand(template);
                        $( ".delete_hand_button" ).removeClass( "disabled" );
                        resetRoundStats();
                    } else {
                        window.alert("You need to fill out who chomboed!");
                    }

                    break;
                    // Push a hand where pao was split and ensure proper information
                case Constants.JPN_DEAL_IN_PAO:
                    // Ensure correct input of winner, loser, and pao player
                    if (Session.get("round_winner") != Constants.NO_PERSON &&
                        Session.get("round_loser") != Constants.NO_PERSON &&
                        Session.get("round_pao_player") != Constants.NO_PERSON &&
                        Session.get("round_winner") != Session.get("round_loser") &&
                        Session.get("round_loser") != Session.get("round_pao_player") &&
                        Session.get("round_pao_player") != Session.get("round_winner")) {
                        //Ensure a valid point/fu combination
                        if (GameRecordUtils.noIllegalJapaneseHands()) {
                            push_split_pao_hand(template);
                            $( ".delete_hand_button" ).removeClass( "disabled" );
                            resetRoundStats();
                        }
                        else {
                            window.alert("Invalid points/fu entry!");
                        }
                    } else {
                        window.alert("You need to fill out who won, who dealt in, and who has pao penalty!");
                    }
                    break;
                    // No other hands should be possible!
                default:
                    break;
                };
            }
            else {
                window.alert("You need to fill out the player information!");
            }

            // If game ending conditions are met, do not allow more hand submissions and allow game submission
            if (GameRecordUtils.japaneseGameOver(handType, template.hands.get())) {
                $( event.target ).addClass( "disabled");
                $( ".submit_game_button" ).removeClass( "disabled" );
            }
        }

    },
    //Remove the last submitted hand
    'click .delete_hand_button'(event, template) {
        if ( !$(event.target ).hasClass( "disabled" )) {
            let r = confirm("Are you sure you want to delete the last hand?");
            // Reset game to last hand state
            if (r === true) {
                // Deletes last hand
                let del_hand = Template.instance().hands.pop();

                Session.set("east_score", Number(Session.get("east_score")) - Number(del_hand.eastDelta));
                Session.set("south_score", Number(Session.get("south_score")) - Number(del_hand.southDelta));
                Session.set("west_score", Number(Session.get("west_score")) - Number(del_hand.westDelta));
                Session.set("north_score", Number(Session.get("north_score")) - Number(del_hand.northDelta));
                Session.set("current_bonus", del_hand.bonus);
                Session.set("current_round", del_hand.round);

                //Set free riichi sticks to last round's value
                Session.set("free_riichi_sticks", template.riichi_sum_history.pop())

                let riichiHistory = template.riichi_round_history.pop();
                if (riichiHistory.east === true) {
                    Session.set("east_riichi_sum", Number(Session.get("east_riichi_sum")) - 1);
                    Session.set("eastPlayerRiichiEV", Number(Session.get("eastPlayerRiichiEV")) - del_hand.eastDelta);
                }
                if (riichiHistory.south === true) {
                    Session.set("south_riichi_sum", Number(Session.get("south_riichi_sum")) - 1);
                    Session.set("southPlayerRiichiEV", Number(Session.get("southPlayerRiichiEV")) - del_hand.southDelta);
                }
                if (riichiHistory.west === true) {
                    Session.set("west_riichi_sum", Number(Session.get("west_riichi_sum")) - 1);
                    Session.set("westPlayerRiichiEV", Number(Session.get("westPlayerRiichiEV")) - del_hand.westDelta);
                }
                if (riichiHistory.north === true) {
                    Session.set("north_riichi_sum", Number(Session.get("north_riichi_sum")) - 1);
                    Session.set("northPlayerRiichiEV", Number(Session.get("northPlayerRiichiEV")) - del_hand.northDelta);
                }

                // Rollback chombo stat
                if (del_hand.handType === Constants.MISTAKE)
                    GameRecordUtils.rollbackChomboStat(del_hand);

                // Rollback hand win/loss stat
                if (del_hand.handType === Constants.DEAL_IN || del_hand.handType === Constants.SELF_DRAW) {
                    // win stat
                    GameRecordUtils.rollbackHandWinStat(del_hand);

                    // win riichis stat
                    GameRecordUtils.rollbackHandRiichiStat(del_hand, riichiHistory);

                    // points stat
                    GameRecordUtils.rollbackTotalPointsStat(del_hand);

                    // loss stat -> may occur when pao selfdraw
                    GameRecordUtils.rollbackHandDealinStat(del_hand);

                    if (Number(del_hand.eastDelta) > 0)
                        Session.set("eastPlayerDoraSum", Number(Session.get("eastPlayerDoraSum")) - del_hand.dora);
                    else if (Number(del_hand.southDelta) > 0)
                        Session.set("southPlayerDoraSum", Number(Session.get("southPlayerDoraSum")) - del_hand.dora);
                    else if (Number(del_hand.westDelta) > 0)
                        Session.set("westPlayerDoraSum", Number(Session.get("westPlayerDoraSum")) - del_hand.dora);
                    else if (Number(del_hand.northDelta) > 0)
                        Session.set("northPlayerDoraSum", Number(Session.get("northPlayerDoraSum")) - del_hand.dora);

                    if (del_hand.handType === Constants.DEAL_IN) {
                        let eastDeltaTemp = Number(del_hand.eastDelta);
                        let southDeltaTemp = Number(del_hand.southDelta);
                        let westDeltaTemp = Number(del_hand.westDelta);
                        let northDeltaTemp = Number(del_hand.northDelta);
                        if (riichiHistory.east === true && ((Number(del_hand.eastDelta) + 1000) !== 0)) {
                            Session.set("eastPlayerDealInAfterRiichiTotal", Number(Session.get("eastPlayerDealInAfterRiichiTotal")) - 1);
                            eastDeltaTemp += 1000;
                        } else if (riichiHistory.south === true && ((Number(del_hand.southDelta) + 1000) !== 0)) {
                            Session.set("southPlayerDealInAfterRiichiTotal", Number(Session.get("southPlayerDealInAfterRiichiTotal")) - 1);
                            southDeltaTemp += 1000;
                        } else if (riichiHistory.west === true && ((Number(del_hand.westDelta) + 1000) !== 0)) {
                            Session.set("westPlayerDealInAfterRiichiTotal", Number(Session.get("westPlayerDealInAfterRiichiTotal")) - 1);
                            westDeltaTemp += 1000;
                        } else if (riichiHistory.north === true && ((Number(del_hand.northDelta) + 1000) !== 0)) {
                            Session.set("northPlayerDealInAfterRiichiTotal", Number(Session.get("northPlayerDealInAfterRiichiTotal")) - 1);
                            northDeltaTemp += 1000;
                        }
                        if (eastDeltaTemp < 0) {
                            Session.set("eastPlayerDealInTotal", Number(Session.get("eastPlayerDealInTotal")) - del_hand.eastDelta);
                        } else if (southDeltaTemp < 0) {
                            Session.set("southPlayerDealInTotal", Number(Session.get("southPlayerDealInTotal")) - del_hand.southDelta);
                        } else if (westDeltaTemp < 0) {
                            Session.set("westPlayerDealInTotal", Number(Session.get("westPlayerDealInTotal")) - del_hand.westDelta);
                        } else if (northDeltaTemp < 0) {
                            Session.set("northPlayerDealInTotal", Number(Session.get("northPlayerDealInTotal")) - del_hand.northDelta);
                        }
                    }

                    if (del_hand.handType === Constants.SELF_DRAW) {
                        if (del_hand.eastDelta > 0) {
                            Session.set("eastPlayerSelfDrawTotal", Number(Session.get("eastPlayerSelfDrawTotal")) - 1);
                        } else if (del_hand.southDelta > 0) {
                            Session.set("southPlayerSelfDrawTotal", Number(Session.get("southPlayerSelfDrawTotal")) - 1);
                        } else if (del_hand.westDelta > 0) {
                            Session.set("westPlayerSelfDrawTotal", Number(Session.get("westPlayerSelfDrawTotal")) - 1);
                        } else if (del_hand.northDelta > 0) {
                            Session.set("northPlayerSelfDrawTotal", Number(Session.get("northPlayerSelfDrawTotal")) - 1);
                        }
                    }
                }

                $( ".submit_hand_button" ).removeClass( "disabled" );
                $( ".submit_game_button" ).addClass( "disabled" );
                if (Template.instance().hands.get().length === 0) {
                    $( ".delete_hand_button" ).addClass( "disabled" );
                }
            }
        }
    },
    //Submit a game to the database
    'click .submit_game_button'(event, template) {
        if ( !$(event.target ).hasClass( "disabled" )) {
            let r = confirm("Are you sure you want to submit this game?");
            if (r === true) {
                if (Session.get("upperJapaneseGame")) {
                    let r2 = confirm("Are you sure this is an upper ranked game?");
                    if (r2 != true) {
                        return;
                    }
                }
                let winScore = Math.max(Number(Session.get("east_score")),
                                        Number(Session.get("south_score")),
                                        Number(Session.get("west_score")),
                                        Number(Session.get("north_score")));

                if (winScore === Session.get("east_score"))
                    Session.set("east_score", winScore + Constants.JPN_RIICHI_POINTS * Number(Session.get("free_riichi_sticks")));
                else if (winScore === Session.get("south_score"))
                    Session.set("south_score", winScore + Constants.JPN_RIICHI_POINTS * Number(Session.get("free_riichi_sticks")));
                else if (winScore === Session.get("west_score"))
                    Session.set("west_score", winScore + Constants.JPN_RIICHI_POINTS * Number(Session.get("free_riichi_sticks")));
                else //if (winScore === Session.get("north_score"))
                    Session.set("north_score", winScore + Constants.JPN_RIICHI_POINTS * Number(Session.get("free_riichi_sticks")));

                save_game_to_database(template.hands.get());

                //Deletes all hands to reset to empty game
                while (template.hands.pop()) {}

                Session.set("east_score", Constants.JPN_START_POINTS);
                Session.set("south_score", Constants.JPN_START_POINTS);
                Session.set("west_score", Constants.JPN_START_POINTS);
                Session.set("north_score", Constants.JPN_START_POINTS);

                Session.set("current_round", 1);
                Session.set("current_bonus", 0);

                Session.set("free_riichi_sticks", 0);

                Session.set("eastPlayerRiichisWon", 0);
                Session.set("southPlayerRiichisWon", 0);
                Session.set("westPlayerRiichisWon", 0);
                Session.set("northPlayerRiichisWon", 0);

                Session.set("eastMistakeTotal", 0);
                Session.set("southMistakeTotal", 0);
                Session.set("westMistakeTotal", 0);
                Session.set("northMistakeTotal", 0);

                Session.set("eastPlayerWins", 0);
                Session.set("southPlayerWins", 0);
                Session.set("westPlayerWins", 0);
                Session.set("northPlayerWins", 0);

                Session.set("eastPlayerPointsWon", 0);
                Session.set("southPlayerPointsWon", 0);
                Session.set("westPlayerPointsWon", 0);
                Session.set("northPlayerPointsWon", 0);

                Session.set("eastPlayerDoraSum", 0);
                Session.set("southPlayerDoraSum", 0);
                Session.set("westPlayerDoraSum", 0);
                Session.set("northPlayerDoraSum", 0);

                Session.set("eastPlayerLosses", 0);
                Session.set("southPlayerLosses", 0);
                Session.set("westPlayerLosses", 0);
                Session.set("northPlayerLosses", 0);

                Session.set("eastPlayerDealInTotal", 0);
                Session.set("southPlayerDealInTotal", 0);
                Session.set("westPlayerDealInTotal", 0);
                Session.set("northPlayerDealInTotal", 0);

                Session.set("eastPlayerDealInAfterRiichiTotal", 0);
                Session.set("southPlayerDealInAfterRiichiTotal", 0);
                Session.set("westPlayerDealInAfterRiichiTotal", 0);
                Session.set("northPlayerDealInAfterRiichiTotal", 0);

                Session.set("eastPlayerSelfDrawTotal", 0);
                Session.set("southPlayerSelfDrawTotal", 0);
                Session.set("westPlayerSelfDrawTotal", 0);
                Session.set("northPlayerSelfDrawTotal", 0);

                Session.set("eastPlayerRiichiEV", 0);
                Session.set("southPlayerRiichiEV", 0);
                Session.set("westPlayerRiichiEV", 0);
                Session.set("northPlayerRiichiEV", 0);

                resetRoundStats();

                $( ".submit_hand_button" ).removeClass( "disabled" );
                $( ".submit_game_button" ).addClass( "disabled" );
                $( ".delete_hand_button" ).addClass( "disabled" );
            }
        }
    },
    //Toggle between different round types
    'click .nav-pills li'( event, template ) {
        let hand_type = $( event.target ).closest( "li" );

        hand_type.addClass( "active" );
        $( ".nav-pills li" ).not( hand_type ).removeClass( "active" );

        template.hand_type.set( hand_type.data( "template" ) );
    },
});

// Save the currently recorded game to database and update player statistics
function save_game_to_database(hands_array) {

    const east_player = Session.get("current_east");
    const south_player= Session.get("current_south");
    const west_player = Session.get("current_west");
    const north_player= Session.get("current_north");

    const tempGame = {
        timestamp: Date.now(),
        east_player: east_player,
        south_player: south_player,
        west_player: west_player,
        north_player: north_player,
        east_score: (Number(Session.get("east_score"))),
        south_score: (Number(Session.get("south_score"))),
        west_score: (Number(Session.get("west_score"))),
        north_score: (Number(Session.get("north_score"))),
        all_hands_after_game: hands_array,
    };

    // Initialise ELO calculator to update player ELO
    const jpn_elo_calculator = new EloCalculator(Constants.ELO_CALCULATOR_N,
                                               Constants.ELO_CALCULATOR_EXP,
                                               Constants.JPN_SCORE_ADJUSTMENT,
                                               tempGame,
                                               Constants.GAME_TYPE.JAPANESE);
    const east_elo_delta = jpn_elo_calculator.eloChange(east_player);
    const south_elo_delta = jpn_elo_calculator.eloChange(south_player);
    const west_elo_delta = jpn_elo_calculator.eloChange(west_player);
    const north_elo_delta = jpn_elo_calculator.eloChange(north_player);

    const east_id = Players.findOne({japaneseLeagueName: east_player}, {})._id;
    const south_id = Players.findOne({japaneseLeagueName: south_player}, {})._id;
    const west_id = Players.findOne({japaneseLeagueName: west_player}, {})._id;
    const north_id = Players.findOne({japaneseLeagueName: north_player}, {})._id;

    const east_elo = Players.findOne({japaneseLeagueName: east_player}, {}).japaneseElo;
    const south_elo = Players.findOne({japaneseLeagueName: south_player}, {}).japaneseElo;
    const west_elo = Players.findOne({japaneseLeagueName: west_player}, {}).japaneseElo;
    const north_elo = Players.findOne({japaneseLeagueName: north_player}, {}).japaneseElo;

    // Initialise game to be saved
    const game = {
        timestamp: Date.now(),
        east_player: east_player,
        south_player: south_player,
        west_player: west_player,
        north_player: north_player,
        east_score: (Number(Session.get("east_score"))),
        south_score: (Number(Session.get("south_score"))),
        west_score: (Number(Session.get("west_score"))),
        north_score: (Number(Session.get("north_score"))),
        east_elo_after_game: east_elo_delta + east_elo,
        south_elo_after_game: south_elo_delta + south_elo,
        west_elo_after_game: west_elo_delta + west_elo,
        north_elo_after_game: north_elo_delta + north_elo,
        all_hands_after_game: hands_array,
    };

    if (east_elo_delta != NaN && south_elo_delta != NaN && west_elo_delta != NaN && north_elo_delta != NaN) {
        // Save ELO
        Players.update({_id: east_id}, {$inc: {japaneseElo: Number(east_elo_delta)}});
        Players.update({_id: south_id}, {$inc: {japaneseElo: Number(south_elo_delta)}});
        Players.update({_id: west_id}, {$inc: {japaneseElo: Number(west_elo_delta)}});
        Players.update({_id: north_id}, {$inc: {japaneseElo: Number(north_elo_delta)}});

        // Update number of games
        Players.update({_id: east_id}, {$inc: {japaneseGamesPlayed: 1}});
        Players.update({_id: south_id}, {$inc: {japaneseGamesPlayed: 1}});
        Players.update({_id: west_id}, {$inc: {japaneseGamesPlayed: 1}});
        Players.update({_id: north_id}, {$inc: {japaneseGamesPlayed: 1}});

        // Update bankruptcy count
        if (Number(Session.get("east_score")) < 0)
            Players.update({_id: east_id}, {$inc: {japaneseBankruptTotal: 1}});
        if (Number(Session.get("south_score")) < 0)
            Players.update({_id: south_id}, {$inc: {japaneseBankruptTotal: 1}});
        if (Number(Session.get("west_score")) < 0)
            Players.update({_id: west_id}, {$inc: {japaneseBankruptTotal: 1}});
        if (Number(Session.get("north_score")) < 0)
            Players.update({_id: north_id}, {$inc: {japaneseBankruptTotal: 1}});

        // Save chombo counts
        Players.update({_id: east_id}, {$inc: {japaneseChomboTotal: Number(Session.get("eastMistakeTotal"))}});
        Players.update({_id: south_id}, {$inc: {japaneseChomboTotal: Number(Session.get("southMistakeTotal"))}});
        Players.update({_id: west_id}, {$inc: {japaneseChomboTotal: Number(Session.get("westMistakeTotal"))}});
        Players.update({_id: north_id}, {$inc: {japaneseChomboTotal: Number(Session.get("northMistakeTotal"))}});

        // Update riichi count
        Players.update({_id: east_id}, {$inc: {japaneseRiichiTotal: Number(Session.get("east_riichi_sum"))}});
        Players.update({_id: south_id}, {$inc: {japaneseRiichiTotal: Number(Session.get("south_riichi_sum"))}});
        Players.update({_id: west_id}, {$inc: {japaneseRiichiTotal: Number(Session.get("west_riichi_sum"))}});
        Players.update({_id: north_id}, {$inc: {japaneseRiichiTotal: Number(Session.get("north_riichi_sum"))}});

        // Update hands count (Includes chombos, do we want this?)
        Players.update({_id: east_id}, {$inc: {japaneseHandsTotal: hands_array.length}});
        Players.update({_id: south_id}, {$inc: {japaneseHandsTotal: hands_array.length}});
        Players.update({_id: west_id}, {$inc: {japaneseHandsTotal: hands_array.length}});
        Players.update({_id: north_id}, {$inc: {japaneseHandsTotal: hands_array.length}});

        // Save number of hands won
        Players.update({_id: east_id}, {$inc: {japaneseHandsWin: Number(Session.get("eastPlayerWins"))}});
        Players.update({_id: south_id}, {$inc: {japaneseHandsWin: Number(Session.get("southPlayerWins"))}});
        Players.update({_id: west_id}, {$inc: {japaneseHandsWin: Number(Session.get("westPlayerWins"))}});
        Players.update({_id: north_id}, {$inc: {japaneseHandsWin: Number(Session.get("northPlayerWins"))}});

        // Save number of points won
        Players.update({_id: east_id}, {$inc: {japaneseWinPointsTotal: Number(Session.get("eastPlayerPointsWon"))}});
        Players.update({_id: south_id}, {$inc: {japaneseWinPointsTotal: Number(Session.get("southPlayerPointsWon"))}});
        Players.update({_id: west_id}, {$inc: {japaneseWinPointsTotal: Number(Session.get("westPlayerPointsWon"))}});
        Players.update({_id: north_id}, {$inc: {japaneseWinPointsTotal: Number(Session.get("northPlayerPointsWon"))}});

        // Update total dora
        Players.update({_id: east_id}, {$inc: {japaneseWinDoraTotal: Number(Session.get("eastPlayerDoraSum"))}});
        Players.update({_id: south_id}, {$inc: {japaneseWinDoraTotal: Number(Session.get("southPlayerDoraSum"))}});
        Players.update({_id: west_id}, {$inc: {japaneseWinDoraTotal: Number(Session.get("westPlayerDoraSum"))}});
        Players.update({_id: north_id}, {$inc: {japaneseWinDoraTotal: Number(Session.get("northPlayerDoraSum"))}});

        // Save number of riichied hands won
        Players.update({_id: east_id}, {$inc: {japaneseWinRiichiTotal: Number(Session.get("eastPlayerRiichisWon"))}});
        Players.update({_id: south_id}, {$inc: {japaneseWinRiichiTotal: Number(Session.get("southPlayerRiichisWon"))}});
        Players.update({_id: west_id}, {$inc: {japaneseWinRiichiTotal: Number(Session.get("westPlayerRiichisWon"))}});
        Players.update({_id: north_id}, {$inc: {japaneseWinRiichiTotal: Number(Session.get("northPlayerRiichisWon"))}});

        // Save number of hands lost
        Players.update({_id: east_id}, {$inc: {japaneseHandsLose: Number(Session.get("eastPlayerLosses"))}});
        Players.update({_id: south_id}, {$inc: {japaneseHandsLose: Number(Session.get("southPlayerLosses"))}});
        Players.update({_id: west_id}, {$inc: {japaneseHandsLose: Number(Session.get("westPlayerLosses"))}});
        Players.update({_id: north_id}, {$inc: {japaneseHandsLose: Number(Session.get("northPlayerLosses"))}});

        // Save total deal in amount
        Players.update({_id: east_id}, {$inc: {japaneseDealInTotal: Number(Session.get("eastPlayerDealInTotal"))}});
        Players.update({_id: south_id}, {$inc: {japaneseDealInTotal: Number(Session.get("southPlayerDealInTotal"))}});
        Players.update({_id: west_id}, {$inc: {japaneseDealInTotal: Number(Session.get("westPlayerDealInTotal"))}});
        Players.update({_id: north_id}, {$inc: {japaneseDealInTotal: Number(Session.get("northPlayerDealInTotal"))}});

        // Save total deal in times after riichi
        Players.update({_id: east_id}, {$inc: {japaneseDealInAfterRiichiTotal: Number(Session.get("eastPlayerDealInAfterRiichiTotal"))}});
        Players.update({_id: south_id}, {$inc: {japaneseDealInAfterRiichiTotal: Number(Session.get("southPlayerDealInAfterRiichiTotal"))}});
        Players.update({_id: west_id}, {$inc: {japaneseDealInAfterRiichiTotal: Number(Session.get("westPlayerDealInAfterRiichiTotal"))}});
        Players.update({_id: north_id}, {$inc: {japaneseDealInAfterRiichiTotal: Number(Session.get("northPlayerDealInAfterRiichiTotal"))}});

        // Save total self draw times
        Players.update({_id: east_id}, {$inc: {japaneseSelfDrawTotal: Number(Session.get("eastPlayerSelfDrawTotal"))}});
        Players.update({_id: south_id}, {$inc: {japaneseSelfDrawTotal: Number(Session.get("southPlayerSelfDrawTotal"))}});
        Players.update({_id: west_id}, {$inc: {japaneseSelfDrawTotal: Number(Session.get("westPlayerSelfDrawTotal"))}});
        Players.update({_id: north_id}, {$inc: {japaneseSelfDrawTotal: Number(Session.get("northPlayerSelfDrawTotal"))}});

        // Save riichi EV
        Players.update({_id: east_id}, {$inc: {japaneseRiichiEV: Number(Session.get("eastPlayerRiichiEV"))}});
        Players.update({_id: south_id}, {$inc: {japaneseRiichiEV: Number(Session.get("southPlayerRiichiEV"))}});
        Players.update({_id: west_id}, {$inc: {japaneseRiichiEV: Number(Session.get("westPlayerRiichiEV"))}});
        Players.update({_id: north_id}, {$inc: {japaneseRiichiEV: Number(Session.get("northPlayerRiichiEV"))}});

        // Calculates all positions quickly
        let positions = Constants.WINDS.map((wind) => ({ wind, score: Session.get(wind + "_score") })).sort((a, b) => b.score - a.score);
        let idMappings = { east: east_id, south: south_id, west: west_id, north: north_id };

        Players.update({ _id: idMappings[positions[0].wind] }, { $inc: { japaneseFirstPlaceSum: 1 }});
        Players.update({ _id: idMappings[positions[1].wind] }, { $inc: { japaneseSecondPlaceSum: 1 }});
        Players.update({ _id: idMappings[positions[2].wind] }, { $inc: { japaneseThirdPlaceSum: 1 }});
        Players.update({ _id: idMappings[positions[3].wind] }, { $inc: { japaneseFourthPlaceSum: 1 }});

        //Save game to database
        JapaneseHands.insert(game);
        if (Session.get("upperJapaneseGame")) {
            // Initialise ELO calculator to update player ELO
            const upper_jpn_elo_calculator = new EloCalculator(Constants.ELO_CALCULATOR_N,
                Constants.ELO_CALCULATOR_EXP,
                Constants.JPN_SCORE_ADJUSTMENT,
                tempGame,
                Constants.GAME_TYPE.UPPER_JAPANESE);
            const upper_east_elo_delta = upper_jpn_elo_calculator.eloChange(east_player);
            const upper_south_elo_delta = upper_jpn_elo_calculator.eloChange(south_player);
            const upper_west_elo_delta = upper_jpn_elo_calculator.eloChange(west_player);
            const upper_north_elo_delta = upper_jpn_elo_calculator.eloChange(north_player);

            const upper_east_id = Players.findOne({japaneseLeagueName: east_player}, {})._id;
            const upper_south_id = Players.findOne({japaneseLeagueName: south_player}, {})._id;
            const upper_west_id = Players.findOne({japaneseLeagueName: west_player}, {})._id;
            const upper_north_id = Players.findOne({japaneseLeagueName: north_player}, {})._id;

            const upper_east_elo = Players.findOne({japaneseLeagueName: east_player}, {}).upperJapaneseElo;
            const upper_south_elo = Players.findOne({japaneseLeagueName: south_player}, {}).upperJapaneseElo;
            const upper_west_elo = Players.findOne({japaneseLeagueName: west_player}, {}).upperJapaneseElo;
            const upper_north_elo = Players.findOne({japaneseLeagueName: north_player}, {}).upperJapaneseElo;

            // Initialise game to be saved
            const gameUpper = {
                timestamp: Date.now(),
                east_player: east_player,
                south_player: south_player,
                west_player: west_player,
                north_player: north_player,
                east_score: (Number(Session.get("east_score"))),
                south_score: (Number(Session.get("south_score"))),
                west_score: (Number(Session.get("west_score"))),
                north_score: (Number(Session.get("north_score"))),
                upper_east_elo_after_game: upper_east_elo_delta + upper_east_elo,
                upper_south_elo_after_game: upper_south_elo_delta + upper_south_elo,
                upper_west_elo_after_game: upper_west_elo_delta + upper_west_elo,
                upper_north_elo_after_game: upper_north_elo_delta + upper_north_elo,
                all_hands_after_game: hands_array,
            };

            if (upper_east_elo_delta != NaN && upper_south_elo_delta != NaN && upper_west_elo_delta != NaN && upper_north_elo_delta != NaN) {
                // Save ELO
                Players.update({_id: upper_east_id}, {$inc: {upperJapaneseElo: Number(upper_east_elo_delta)}});
                Players.update({_id: upper_south_id}, {$inc: {upperJapaneseElo: Number(upper_south_elo_delta)}});
                Players.update({_id: upper_west_id}, {$inc: {upperJapaneseElo: Number(upper_west_elo_delta)}});
                Players.update({_id: upper_north_id}, {$inc: {upperJapaneseElo: Number(upper_north_elo_delta)}});

                // Update number of games
                Players.update({_id: upper_east_id}, {$inc: {upperJapaneseGamesPlayed: 1}});
                Players.update({_id: upper_south_id}, {$inc: {upperJapaneseGamesPlayed: 1}});
                Players.update({_id: upper_west_id}, {$inc: {upperJapaneseGamesPlayed: 1}});
                Players.update({_id: upper_north_id}, {$inc: {upperJapaneseGamesPlayed: 1}});

                // Update bankruptcy count
                if (Number(Session.get("east_score")) < 0)
                    Players.update({_id: upper_east_id}, {$inc: {upperJapaneseBankruptTotal: 1}});
                if (Number(Session.get("south_score")) < 0)
                    Players.update({_id: upper_south_id}, {$inc: {upperJapaneseBankruptTotal: 1}});
                if (Number(Session.get("west_score")) < 0)
                    Players.update({_id: upper_west_id}, {$inc: {upperJapaneseBankruptTotal: 1}});
                if (Number(Session.get("north_score")) < 0)
                    Players.update({_id: upper_north_id}, {$inc: {upperJapaneseBankruptTotal: 1}});

                // Save chombo counts
                Players.update({_id: upper_east_id}, {$inc: {upperJapaneseChomboTotal: Number(Session.get("eastMistakeTotal"))}});
                Players.update({_id: upper_south_id}, {$inc: {upperJapaneseChomboTotal: Number(Session.get("southMistakeTotal"))}});
                Players.update({_id: upper_west_id}, {$inc: {upperJapaneseChomboTotal: Number(Session.get("westMistakeTotal"))}});
                Players.update({_id: upper_north_id}, {$inc: {upperJapaneseChomboTotal: Number(Session.get("northMistakeTotal"))}});

                // Update riichi count
                Players.update({_id: upper_east_id}, {$inc: {upperJapaneseRiichiTotal: Number(Session.get("east_riichi_sum"))}});
                Players.update({_id: upper_south_id}, {$inc: {upperJapaneseRiichiTotal: Number(Session.get("south_riichi_sum"))}});
                Players.update({_id: upper_west_id}, {$inc: {upperJapaneseRiichiTotal: Number(Session.get("west_riichi_sum"))}});
                Players.update({_id: upper_north_id}, {$inc: {upperJapaneseRiichiTotal: Number(Session.get("north_riichi_sum"))}});

                // Update hands count (Includes chombos, do we want this?)
                Players.update({_id: upper_east_id}, {$inc: {upperJapaneseHandsTotal: hands_array.length}});
                Players.update({_id: upper_south_id}, {$inc: {upperJapaneseHandsTotal: hands_array.length}});
                Players.update({_id: upper_west_id}, {$inc: {upperJapaneseHandsTotal: hands_array.length}});
                Players.update({_id: upper_north_id}, {$inc: {upperJapaneseHandsTotal: hands_array.length}});

                // Save number of hands won
                Players.update({_id: upper_east_id}, {$inc: {upperJapaneseHandsWin: Number(Session.get("eastPlayerWins"))}});
                Players.update({_id: upper_south_id}, {$inc: {upperJapaneseHandsWin: Number(Session.get("southPlayerWins"))}});
                Players.update({_id: upper_west_id}, {$inc: {upperJapaneseHandsWin: Number(Session.get("westPlayerWins"))}});
                Players.update({_id: upper_north_id}, {$inc: {upperJapaneseHandsWin: Number(Session.get("northPlayerWins"))}});

                // Save number of points won
                Players.update({_id: upper_east_id}, {$inc: {upperJapaneseWinPointsTotal: Number(Session.get("eastPlayerPointsWon"))}});
                Players.update({_id: upper_south_id}, {$inc: {upperJapaneseWinPointsTotal: Number(Session.get("southPlayerPointsWon"))}});
                Players.update({_id: upper_west_id}, {$inc: {upperJapaneseWinPointsTotal: Number(Session.get("westPlayerPointsWon"))}});
                Players.update({_id: upper_north_id}, {$inc: {upperJapaneseWinPointsTotal: Number(Session.get("northPlayerPointsWon"))}});

                // Update total dora
                Players.update({_id: upper_east_id}, {$inc: {upperJapaneseWinDoraTotal: Number(Session.get("eastPlayerDoraSum"))}});
                Players.update({_id: upper_south_id}, {$inc: {upperJapaneseWinDoraTotal: Number(Session.get("southPlayerDoraSum"))}});
                Players.update({_id: upper_west_id}, {$inc: {upperJapaneseWinDoraTotal: Number(Session.get("westPlayerDoraSum"))}});
                Players.update({_id: upper_north_id}, {$inc: {upperJapaneseWinDoraTotal: Number(Session.get("northPlayerDoraSum"))}});

                // Save number of riichied hands won
                Players.update({_id: upper_east_id}, {$inc: {upperJapaneseWinRiichiTotal: Number(Session.get("eastPlayerRiichisWon"))}});
                Players.update({_id: upper_south_id}, {$inc: {upperJapaneseWinRiichiTotal: Number(Session.get("southPlayerRiichisWon"))}});
                Players.update({_id: upper_west_id}, {$inc: {upperJapaneseWinRiichiTotal: Number(Session.get("westPlayerRiichisWon"))}});
                Players.update({_id: upper_north_id}, {$inc: {upperJapaneseWinRiichiTotal: Number(Session.get("northPlayerRiichisWon"))}});

                // Save number of hands lost
                Players.update({_id: upper_east_id}, {$inc: {upperJapaneseHandsLose: Number(Session.get("eastPlayerLosses"))}});
                Players.update({_id: upper_south_id}, {$inc: {upperJapaneseHandsLose: Number(Session.get("southPlayerLosses"))}});
                Players.update({_id: upper_west_id}, {$inc: {upperJapaneseHandsLose: Number(Session.get("westPlayerLosses"))}});
                Players.update({_id: upper_north_id}, {$inc: {upperJapaneseHandsLose: Number(Session.get("northPlayerLosses"))}});

                // Save total deal in amount
                Players.update({_id: upper_east_id}, {$inc: {upperJapaneseDealInTotal: Number(Session.get("eastPlayerDealInTotal"))}});
                Players.update({_id: upper_south_id}, {$inc: {upperJapaneseDealInTotal: Number(Session.get("southPlayerDealInTotal"))}});
                Players.update({_id: upper_west_id}, {$inc: {upperJapaneseDealInTotal: Number(Session.get("westPlayerDealInTotal"))}});
                Players.update({_id: upper_north_id}, {$inc: {upperJapaneseDealInTotal: Number(Session.get("northPlayerDealInTotal"))}});

                // Save total deal in times after riichi
                Players.update({_id: upper_east_id}, {$inc: {upperJapaneseDealInAfterRiichiTotal: Number(Session.get("eastPlayerDealInAfterRiichiTotal"))}});
                Players.update({_id: upper_south_id}, {$inc: {upperJapaneseDealInAfterRiichiTotal: Number(Session.get("southPlayerDealInAfterRiichiTotal"))}});
                Players.update({_id: upper_west_id}, {$inc: {upperJapaneseDealInAfterRiichiTotal: Number(Session.get("westPlayerDealInAfterRiichiTotal"))}});
                Players.update({_id: upper_north_id}, {$inc: {upperJapaneseDealInAfterRiichiTotal: Number(Session.get("northPlayerDealInAfterRiichiTotal"))}});

                // Save total self draw times
                Players.update({_id: upper_east_id}, {$inc: {upperJapaneseSelfDrawTotal: Number(Session.get("eastPlayerSelfDrawTotal"))}});
                Players.update({_id: upper_south_id}, {$inc: {upperJapaneseSelfDrawTotal: Number(Session.get("southPlayerSelfDrawTotal"))}});
                Players.update({_id: upper_west_id}, {$inc: {upperJapaneseSelfDrawTotal: Number(Session.get("westPlayerSelfDrawTotal"))}});
                Players.update({_id: upper_north_id}, {$inc: {upperJapaneseSelfDrawTotal: Number(Session.get("northPlayerSelfDrawTotal"))}});

                // Save total self draw times
                Players.update({_id: upper_east_id}, {$inc: {upperJapaneseRiichiEV: Number(Session.get("eastPlayerRiichiEV"))}});
                Players.update({_id: upper_south_id}, {$inc: {upperJapaneseRiichiEV: Number(Session.get("southPlayerRiichiEV"))}});
                Players.update({_id: upper_west_id}, {$inc: {upperJapaneseRiichiEV: Number(Session.get("westPlayerRiichiEV"))}});
                Players.update({_id: upper_north_id}, {$inc: {upperJapaneseRiichiEV: Number(Session.get("northPlayerRiichiEV"))}});

                // Calculates all positions quickly
                let positions = Constants.WINDS.map((wind) => ({
                    wind,
                    score: Session.get(wind + "_score")
                })).sort((a, b) => b.score - a.score);
                let idMappings = {east: upper_east_id, south: upper_south_id, west: upper_west_id, north: upper_north_id};

                Players.update({_id: idMappings[positions[0].wind]}, {$inc: {upperJapaneseFirstPlaceSum: 1}});
                Players.update({_id: idMappings[positions[1].wind]}, {$inc: {upperJapaneseSecondPlaceSum: 1}});
                Players.update({_id: idMappings[positions[2].wind]}, {$inc: {upperJapaneseThirdPlaceSum: 1}});
                Players.update({_id: idMappings[positions[3].wind]}, {$inc: {upperJapaneseFourthPlaceSum: 1}});
            }
            UpperJapaneseHands.insert(gameUpper);
        }
    }
};

function push_dealin_hand(template) {
    const points = Number(Session.get("current_points"));
    const fu = Number(Session.get("current_fu"));
    const dora = Number(Session.get("current_dora"));
    const dealerWind = GameRecordUtils.roundToDealerDirection(Number(Session.get("current_round")));
    const winnerWind = GameRecordUtils.playerToDirection(Session.get("round_winner"));
    const loserWind = GameRecordUtils.playerToDirection(Session.get("round_loser"));
    let riichiSum = Session.get("free_riichi_sticks");
    let seatDeltas = {};
    Constants.WINDS.forEach(w => seatDeltas[w] = 0);

    // Find riichis and save them to allocate them
    if (Session.get("east_riichi") === true) {
        seatDeltas[Constants.EAST] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("east_riichi_sum", Number(Session.get("east_riichi_sum")) + 1);
    }
    if (Session.get("south_riichi") === true) {
        seatDeltas[Constants.SOUTH] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("south_riichi_sum", Number(Session.get("south_riichi_sum")) + 1);
    }
    if (Session.get("west_riichi") === true) {
        seatDeltas[Constants.WEST] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("west_riichi_sum", Number(Session.get("west_riichi_sum")) + 1);
    }
    if (Session.get("north_riichi") === true) {
        seatDeltas[Constants.NORTH] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("north_riichi_sum", Number(Session.get("north_riichi_sum")) + 1);
    }

    let handDeltas = HandScoreCalculator.jpn.dealinDelta(points,
        fu,
        Number(Session.get("current_bonus")),
        dealerWind,
        winnerWind,
        loserWind,
        riichiSum);
    // Accumulate hand deltas for this round
    for (const seat of Constants.WINDS) {
        seatDeltas[seat] += handDeltas[seat];
    }

    if (winnerWind === Constants.EAST) {
        Session.set("eastPlayerWins", Number(Session.get("eastPlayerWins")) + 1);
        Session.set("eastPlayerPointsWon", Number(Session.get("eastPlayerPointsWon")) + seatDeltas["east"]);
        Session.set("eastPlayerDoraSum", Number(Session.get("eastPlayerDoraSum")) + dora);
        if (Session.get("east_riichi") === true) {
            Session.set("eastPlayerRiichisWon", Number(Session.get("eastPlayerRiichisWon")) + 1);
            Session.set("eastPlayerRiichiEV", Number(Session.get("eastPlayerRiichiEV")) + seatDeltas["east"]);
        }
    }
    else if (winnerWind === Constants.SOUTH) {
        Session.set("southPlayerWins", Number(Session.get("southPlayerWins")) + 1);
        Session.set("southPlayerPointsWon", Number(Session.get("southPlayerPointsWon")) + seatDeltas["south"]);
        Session.set("southPlayerDoraSum", Number(Session.get("southPlayerDoraSum")) + dora);
        if (Session.get("south_riichi") === true) {
            Session.set("southPlayerRiichisWon", Number(Session.get("southPlayerRiichisWon")) + 1);
            Session.set("southPlayerRiichiEV", Number(Session.get("southPlayerRiichiEV")) + seatDeltas["south"]);
        }
    }
    else if (winnerWind === Constants.WEST) {
        Session.set("westPlayerWins", Number(Session.get("westPlayerWins")) + 1);
        Session.set("westPlayerPointsWon", Number(Session.get("westPlayerPointsWon")) + seatDeltas["west"]);
        Session.set("westPlayerDoraSum", Number(Session.get("westPlayerDoraSum")) + dora);
        if (Session.get("west_riichi") === true) {
            Session.set("westPlayerRiichisWon", Number(Session.get("westPlayerRiichisWon")) + 1);
            Session.set("westPlayerRiichiEV", Number(Session.get("westPlayerRiichiEV")) + seatDeltas["west"]);
        }
    }
    else if (winnerWind === Constants.NORTH) {
        Session.set("northPlayerWins", Number(Session.get("northPlayerWins")) + 1);
        Session.set("northPlayerPointsWon", Number(Session.get("northPlayerPointsWon")) + seatDeltas["north"]);
        Session.set("northPlayerDoraSum", Number(Session.get("northPlayerDoraSum")) + dora);
        if (Session.get("north_riichi") === true) {
            Session.set("northPlayerRiichisWon", Number(Session.get("northPlayerRiichisWon")) + 1);
            Session.set("northPlayerRiichiEV", Number(Session.get("northPlayerRiichiEV")) + seatDeltas["north"]);
        }
    }

    if (loserWind === Constants.EAST) {
        Session.set("eastPlayerLosses", Number(Session.get("eastPlayerLosses")) + 1);
        Session.set("eastPlayerDealInTotal", Number(Session.get("eastPlayerDealInTotal")) - seatDeltas["east"]);
        if (Session.get("east_riichi") === true) {
            Session.set("eastPlayerDealInAfterRiichiTotal", Number(Session.get("eastPlayerDealInAfterRiichiTotal")) + 1);
            Session.set("eastPlayerRiichiEV", Number(Session.get("eastPlayerRiichiEV")) + seatDeltas["east"]);
        }

    } else if (loserWind === Constants.SOUTH) {
        Session.set("southPlayerLosses", Number(Session.get("southPlayerLosses")) + 1);
        Session.set("southPlayerDealInTotal", Number(Session.get("southPlayerDealInTotal")) - seatDeltas["south"]);
        if (Session.get("south_riichi") === true) {
            Session.set("southPlayerDealInAfterRiichiTotal", Number(Session.get("southPlayerDealInAfterRiichiTotal")) + 1);
            Session.set("southPlayerRiichiEV", Number(Session.get("southPlayerRiichiEV")) + seatDeltas["south"]);
        }
    } else if (loserWind === Constants.WEST) {
        Session.set("westPlayerLosses", Number(Session.get("westPlayerLosses")) + 1);
        Session.set("westPlayerDealInTotal", Number(Session.get("westPlayerDealInTotal")) - seatDeltas["west"]);
        if (Session.get("west_riichi") === true) {
            Session.set("westPlayerDealInAfterRiichiTotal", Number(Session.get("westPlayerDealInAfterRiichiTotal")) + 1);
            Session.set("westPlayerRiichiEV", Number(Session.get("westPlayerRiichiEV")) + seatDeltas["west"]);
        }
    } else if (loserWind === Constants.NORTH) {
        Session.set("northPlayerLosses", Number(Session.get("northPlayerLosses")) + 1);
        Session.set("northPlayerDealInTotal", Number(Session.get("northPlayerDealInTotal")) - seatDeltas["north"]);
        if (Session.get("north_riichi") === true) {
            Session.set("northPlayerDealInAfterRiichiTotal", Number(Session.get("northPlayerDealInAfterRiichiTotal")) + 1);
            Session.set("northPlayerRiichiEV", Number(Session.get("northPlayerRiichiEV")) + seatDeltas["north"]);
        }
    }

    if (loserWind != Constants.EAST && winnerWind != Constants.EAST && Session.get("east_riichi") === true) {
        Session.set("eastPlayerRiichiEV", Number(Session.get("eastPlayerRiichiEV")) - 1000);
    }
    if (loserWind != Constants.SOUTH && winnerWind != Constants.SOUTH && Session.get("south_riichi") === true) {
        Session.set("southPlayerRiichiEV", Number(Session.get("southPlayerRiichiEV")) - 1000);
    }
    if (loserWind != Constants.WEST && winnerWind != Constants.WEST && Session.get("west_riichi") === true) {
        Session.set("westPlayerRiichiEV", Number(Session.get("westPlayerRiichiEV")) - 1000);
    }
    if (loserWind != Constants.NORTH && winnerWind != Constants.NORTH && Session.get("north_riichi") === true) {
        Session.set("northPlayerRiichiEV", Number(Session.get("northPlayerRiichiEV")) - 1000);
    }

    pushHand(template,
        Constants.DEAL_IN,
        seatDeltas[Constants.EAST],
        seatDeltas[Constants.SOUTH],
        seatDeltas[Constants.WEST],
        seatDeltas[Constants.NORTH],
        {east: Session.get("east_riichi"),
            south: Session.get("south_riichi"),
            west: Session.get("west_riichi"),
            north: Session.get("north_riichi")});

    Session.set("free_riichi_sticks", 0);

    if (winnerWind === dealerWind) {
        Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
    } else {
        Session.set("current_bonus", 0);
        Session.set("current_round", Number(Session.get("current_round")) + 1)
    }

    template.riichi_round_history.push({east: Session.get("east_riichi"),
                                        south: Session.get("south_riichi"),
                                        west: Session.get("west_riichi"),
                                        north: Session.get("north_riichi")});
};

function push_selfdraw_hand(template) {
    const points = Number(Session.get("current_points"));
    const fu = Number(Session.get("current_fu"));
    const dora = Number(Session.get("current_dora"));
    const dealerWind = GameRecordUtils.roundToDealerDirection(Number(Session.get("current_round")));
    const winnerWind = GameRecordUtils.playerToDirection(Session.get("round_winner"));
    let riichiSum = Session.get("free_riichi_sticks");
    let seatDeltas = {};
    Constants.WINDS.forEach(w => seatDeltas[w] = 0);

    if (Session.get("east_riichi") === true) {
        seatDeltas[Constants.EAST] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("east_riichi_sum", Number(Session.get("east_riichi_sum")) + 1);
    }
    if (Session.get("south_riichi") === true) {
        seatDeltas[Constants.SOUTH] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("south_riichi_sum", Number(Session.get("south_riichi_sum")) + 1);
    }
    if (Session.get("west_riichi") === true) {
        seatDeltas[Constants.WEST] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("west_riichi_sum", Number(Session.get("west_riichi_sum")) + 1);
    }
    if (Session.get("north_riichi") === true) {
        seatDeltas[Constants.NORTH] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("north_riichi_sum", Number(Session.get("north_riichi_sum")) + 1);
    }

    let handDeltas = HandScoreCalculator.jpn.selfDrawDelta(points,
        fu,
        Number(Session.get("current_bonus")),
        dealerWind,
        winnerWind,
        riichiSum);

    // Accumulate hand deltas for this round
    for (const seat of Constants.WINDS) {
        seatDeltas[seat] += handDeltas[seat];
    }

    if (Session.get("east_riichi") === true) {
        if (winnerWind != Constants.EAST) {
            Session.set("eastPlayerRiichiEV", Number(Session.get("eastPlayerRiichiEV")) + seatDeltas["east"]);
        }
    }
    if (Session.get("south_riichi") === true) {
        if (winnerWind != Constants.SOUTH) {
            Session.set("southPlayerRiichiEV", Number(Session.get("southPlayerRiichiEV")) + seatDeltas["south"]);
        }
    }
    if (Session.get("west_riichi") === true) {
        if (winnerWind != Constants.WEST) {
            Session.set("westPlayerRiichiEV", Number(Session.get("westPlayerRiichiEV")) + seatDeltas["west"]);
        }
    }
    if (Session.get("north_riichi") === true) {
        if (winnerWind != Constants.NORTH) {
            Session.set("northPlayerRiichiEV", Number(Session.get("northPlayerRiichiEV")) + seatDeltas["north"]);
        }
    }

    if (winnerWind === Constants.EAST) {
        Session.set("eastPlayerWins", Number(Session.get("eastPlayerWins")) + 1);
        Session.set("eastPlayerPointsWon", Number(Session.get("eastPlayerPointsWon")) + seatDeltas["east"]);
        Session.set("eastPlayerDoraSum", Number(Session.get("eastPlayerDoraSum")) + dora);
        Session.set("eastPlayerSelfDrawTotal", Number(Session.get("eastPlayerSelfDrawTotal")) + 1)
        if (Session.get("east_riichi") === true) {
            Session.set("eastPlayerRiichisWon", Number(Session.get("eastPlayerRiichisWon")) + 1);
            Session.set("eastPlayerRiichiEV", Number(Session.get("eastPlayerRiichiEV")) + seatDeltas["east"]);
        }
    }
    else if (winnerWind === Constants.SOUTH) {
        Session.set("southPlayerWins", Number(Session.get("southPlayerWins")) + 1);
        Session.set("southPlayerPointsWon", Number(Session.get("southPlayerPointsWon")) + seatDeltas["south"]);
        Session.set("southPlayerDoraSum", Number(Session.get("southPlayerDoraSum")) + dora);
        Session.set("southPlayerSelfDrawTotal", Number(Session.get("southPlayerSelfDrawTotal")) + 1)
        if (Session.get("south_riichi") === true) {
            Session.set("southPlayerRiichisWon", Number(Session.get("southPlayerRiichisWon")) + 1);
            Session.set("southPlayerRiichiEV", Number(Session.get("southPlayerRiichiEV")) + seatDeltas["south"]);
        }
    }
    else if (winnerWind === Constants.WEST) {
        Session.set("westPlayerWins", Number(Session.get("westPlayerWins")) + 1);
        Session.set("westPlayerPointsWon", Number(Session.get("westPlayerPointsWon")) + seatDeltas["west"]);
        Session.set("westPlayerDoraSum", Number(Session.get("westPlayerDoraSum")) + dora);
        Session.set("westPlayerSelfDrawTotal", Number(Session.get("westPlayerSelfDrawTotal")) + 1)
        if (Session.get("west_riichi") === true) {
            Session.set("westPlayerRiichisWon", Number(Session.get("westPlayerRiichisWon")) + 1);
            Session.set("westPlayerRiichiEV", Number(Session.get("westPlayerRiichiEV")) + seatDeltas["west"]);
        }
    }
    else if (winnerWind === Constants.NORTH) {
        Session.set("northPlayerWins", Number(Session.get("northPlayerWins")) + 1);
        Session.set("northPlayerPointsWon", Number(Session.get("northPlayerPointsWon")) + seatDeltas["north"]);
        Session.set("northPlayerDoraSum", Number(Session.get("northPlayerDoraSum")) + dora);
        Session.set("northPlayerSelfDrawTotal", Number(Session.get("northPlayerSelfDrawTotal")) + 1)
        if (Session.get("north_riichi") === true) {
            Session.set("northPlayerRiichisWon", Number(Session.get("northPlayerRiichisWon")) + 1);
            Session.set("northPlayerRiichiEV", Number(Session.get("northPlayerRiichiEV")) + seatDeltas["north"]);
        }
    }

    pushHand(template,
             Constants.SELF_DRAW,
             seatDeltas[Constants.EAST],
             seatDeltas[Constants.SOUTH],
             seatDeltas[Constants.WEST],
             seatDeltas[Constants.NORTH],
            {east: Session.get("east_riichi"),
                south: Session.get("south_riichi"),
                west: Session.get("west_riichi"),
                north: Session.get("north_riichi")});

    Session.set("free_riichi_sticks", 0);

    if (winnerWind === dealerWind)
        Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
    else {
        Session.set("current_bonus", 0);
        Session.set("current_round", Number(Session.get("current_round")) + 1);
    }

    template.riichi_round_history.push({east: Session.get("east_riichi"),
                                        south: Session.get("south_riichi"),
                                        west: Session.get("west_riichi"),
                                        north: Session.get("north_riichi")});
};

function push_nowin_hand(template) {
    let eastDelta = 0, southDelta = 0, westDelta = 0, northDelta = 0;
    let tenpaiSum = 0, tenpaiWin, tenpaiLose, riichiSum = 0;

    if (Session.get("east_tenpai") === true) tenpaiSum++;
    if (Session.get("south_tenpai") === true) tenpaiSum++;
    if (Session.get("west_tenpai") === true) tenpaiSum++;
    if (Session.get("north_tenpai") === true) tenpaiSum++;

    tenpaiWin = Constants.JPN_TENPAI_PAYOUT / tenpaiSum;
    tenpaiLose = -Constants.JPN_TENPAI_PAYOUT / (4 - tenpaiSum);
    if (tenpaiSum != 4 && tenpaiSum != 0) {
        eastDelta += Session.get("east_tenpai") === true ? tenpaiWin : tenpaiLose;
        southDelta += Session.get("south_tenpai") === true ? tenpaiWin : tenpaiLose;
        westDelta += Session.get("west_tenpai") === true ? tenpaiWin : tenpaiLose;
        northDelta += Session.get("north_tenpai") === true ? tenpaiWin : tenpaiLose;
    }

    if (Session.get("east_riichi") === true) {
        eastDelta -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("east_riichi_sum", Number(Session.get("east_riichi_sum")) + 1);
        Session.set("eastPlayerRiichiEV", Number(Session.get("eastPlayerRiichiEV")) + eastDelta);
    }
    if (Session.get("south_riichi") === true) {
        southDelta -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("south_riichi_sum", Number(Session.get("south_riichi_sum")) + 1);
        Session.set("southPlayerRiichiEV", Number(Session.get("southPlayerRiichiEV")) + southDelta);
    }
    if (Session.get("west_riichi") === true) {
        westDelta -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("west_riichi_sum", Number(Session.get("west_riichi_sum")) + 1);
        Session.set("westPlayerRiichiEV", Number(Session.get("westPlayerRiichiEV")) + westDelta);
    }
    if (Session.get("north_riichi") === true) {
        northDelta -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("north_riichi_sum", Number(Session.get("north_riichi_sum")) + 1);
        Session.set("northPlayerRiichiEV", Number(Session.get("northPlayerRiichiEV")) + northDelta);
    }

    Session.set("free_riichi_sticks", Number(Session.get("free_riichi_sticks")) + riichiSum);

    pushHand(template, Constants.NO_WIN, eastDelta, southDelta, westDelta, northDelta,
        {east: Session.get("east_riichi"),
            south: Session.get("south_riichi"),
            west: Session.get("west_riichi"),
            north: Session.get("north_riichi")});

    if (Session.get(GameRecordUtils.roundToDealerDirection(Session.get("current_round")) + "_tenpai") === true)
        Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
    else {
        Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
        Session.set("current_round", Number(Session.get("current_round")) + 1);
    }

    template.riichi_round_history.push({east: Session.get("east_riichi"),
                                        south: Session.get("south_riichi"),
                                        west: Session.get("west_riichi"),
                                        north: Session.get("north_riichi")});
};

function push_restart_hand(template) {
    let eastDelta = 0, southDelta = 0, westDelta = 0, northDelta = 0;
    let riichiSum = 0;

    if (Session.get("east_riichi") === true) {
        eastDelta -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("east_riichi_sum", Number(Session.get("east_riichi_sum")) + 1);
        Session.set("eastPlayerRiichiEV", Number(Session.get("eastPlayerRiichiEV")) + eastDelta);
    }
    if (Session.get("south_riichi") === true) {
        southDelta -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("south_riichi_sum", Number(Session.get("south_riichi_sum")) + 1);
        Session.set("southPlayerRiichiEV", Number(Session.get("southPlayerRiichiEV")) + southDelta);
    }
    if (Session.get("west_riichi") === true) {
        westDelta -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("west_riichi_sum", Number(Session.get("west_riichi_sum")) + 1);
        Session.set("westPlayerRiichiEV", Number(Session.get("westPlayerRiichiEV")) + westDelta);
    }
    if (Session.get("north_riichi") === true) {
        northDelta -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("north_riichi_sum", Number(Session.get("north_riichi_sum")) + 1);
        Session.set("northPlayerRiichiEV", Number(Session.get("northPlayerRiichiEV")) + northDelta);
    }

    Session.set("free_riichi_sticks", Number(Session.get("free_riichi_sticks")) + riichiSum);

    pushHand(template, Constants.RESTART, eastDelta, southDelta, westDelta, northDelta,
        {east: Session.get("east_riichi"),
            south: Session.get("south_riichi"),
            west: Session.get("west_riichi"),
            north: Session.get("north_riichi")});

    Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);

    template.riichi_round_history.push({east: Session.get("east_riichi"),
                                        south: Session.get("south_riichi"),
                                        west: Session.get("west_riichi"),
                                        north: Session.get("north_riichi")});
};

function push_mistake_hand(template) {
    let loserWind = GameRecordUtils.playerToDirection(Session.get("round_loser"));
    let handDeltas = HandScoreCalculator.jpn.mistakeDelta(loserWind);

    if (loserWind === Constants.EAST) {
        Session.set("eastMistakeTotal", Number(Session.get("eastMistakeTotal")) + 1);
    } else if (loserWind === Constants.SOUTH) {
        Session.set("southMistakeTotal", Number(Session.get("southMistakeTotal")) + 1);
    } else if (loserWind === Constants.WEST) {
        Session.set("westMistakeTotal", Number(Session.get("westMistakeTotal")) + 1);
    } else if (loserWind === Constants.NORTH) {
        Session.set("northMistakeTotal", Number(Session.get("northMistakeTotal")) + 1);
    }

    pushHand(template,
             Constants.MISTAKE,
             handDeltas[Constants.EAST],
             handDeltas[Constants.SOUTH],
             handDeltas[Constants.WEST],
             handDeltas[Constants.NORTH],
            {east: Session.get("east_riichi"),
                south: Session.get("south_riichi"),
                west: Session.get("west_riichi"),
                north: Session.get("north_riichi")});

    template.riichi_round_history.push({east: false,
                                        south: false,
                                        west: false,
                                        north: false});
};

function push_split_pao_hand(template) {
    const points = Number(Session.get("current_points"));
    const fu = Number(Session.get("current_fu"));
    const dora = Number(Session.get("current_dora"));
    const dealerWind = GameRecordUtils.roundToDealerDirection(Number(Session.get("current_round")));
    const winnerWind = GameRecordUtils.playerToDirection(Session.get("round_winner"));
    const loserWind = GameRecordUtils.playerToDirection(Session.get("round_loser"));
    const paoWind = GameRecordUtils.playerToDirection(Session.get("round_pao_player"));
    let riichiSum = Session.get("free_riichi_sticks");
    let seatDeltas = {};
    Constants.WINDS.forEach(w => seatDeltas[w] = 0);

    let value = HandScoreCalculator.jpn.dealinDelta(points,
        fu,
        Number(Session.get("current_bonus")),
        dealerWind,
        winnerWind,
        loserWind,
        0)[winnerWind];

    if (((value / 2 ) % 100) === 50) {
        value += 100;
    }

    if (Session.get("east_riichi") === true) {
        seatDeltas[Constants.EAST] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("east_riichi_sum", Number(Session.get("east_riichi_sum")) + 1);
        if (winnerWind != Constants.EAST) {
            Session.set("eastPlayerRiichiEV", Number(Session.get("eastPlayerRiichiEV")) - 1000);
        }
    }
    if (Session.get("south_riichi") === true) {
        seatDeltas[Constants.SOUTH] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("south_riichi_sum", Number(Session.get("south_riichi_sum")) + 1);
    }
    if (Session.get("west_riichi") === true) {
        seatDeltas[Constants.WEST] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("west_riichi_sum", Number(Session.get("west_riichi_sum")) + 1);
    }
    if (Session.get("north_riichi") === true) {
        seatDeltas[Constants.NORTH] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("north_riichi_sum", Number(Session.get("north_riichi_sum")) + 1);
    }

    // Accumulate hand deltas for this round
    for (const wind of Constants.WINDS) {
        if (wind === winnerWind) {
            seatDeltas[wind] += value + riichiSum * Constants.JPN_RIICHI_POINTS;
        } else if (wind === loserWind || wind === paoWind) {
            seatDeltas[wind] -= value / 2;
        }
    }

    if (winnerWind === Constants.EAST) {
        Session.set("eastPlayerWins", Number(Session.get("eastPlayerWins")) + 1);
        Session.set("eastPlayerPointsWon", Number(Session.get("eastPlayerPointsWon")) + seatDeltas["east"]);
        Session.set("eastPlayerDoraSum", Number(Session.get("eastPlayerDoraSum")) + dora);
        if (Session.get("east_riichi") === true) {
            Session.set("eastPlayerRiichisWon", Number(Session.get("eastPlayerRiichisWon")) + 1);
            Session.set("eastPlayerRiichiEV", Number(Session.get("eastPlayerRiichiEV")) + seatDeltas["east"]);
        }
    }
    else if (winnerWind === Constants.SOUTH) {
        Session.set("southPlayerWins", Number(Session.get("southPlayerWins")) + 1);
        Session.set("southPlayerPointsWon", Number(Session.get("southPlayerPointsWon")) + seatDeltas["south"]);
        Session.set("southPlayerDoraSum", Number(Session.get("southPlayerDoraSum")) + dora);
        if (Session.get("south_riichi") === true) {
            Session.set("southPlayerRiichisWon", Number(Session.get("southPlayerRiichisWon")) + 1);
            Session.set("southPlayerRiichiEV", Number(Session.get("southPlayerRiichiEV")) + seatDeltas["south"]);
        }
    }
    else if (winnerWind === Constants.WEST) {
        Session.set("westPlayerWins", Number(Session.get("westPlayerWins")) + 1);
        Session.set("westPlayerPointsWon", Number(Session.get("westPlayerPointsWon")) + seatDeltas["west"]);
        Session.set("westPlayerDoraSum", Number(Session.get("westPlayerDoraSum")) + dora);
        if (Session.get("west_riichi") === true) {
            Session.set("westPlayerRiichisWon", Number(Session.get("westPlayerRiichisWon")) + 1);
            Session.set("westPlayerRiichiEV", Number(Session.get("westPlayerRiichiEV")) + seatDeltas["west"]);
        }
    }
    else if (winnerWind === Constants.NORTH) {
        Session.set("northPlayerWins", Number(Session.get("northPlayerWins")) + 1);
        Session.set("northPlayerPointsWon", Number(Session.get("northPlayerPointsWon")) + seatDeltas["north"]);
        Session.set("northPlayerDoraSum", Number(Session.get("northPlayerDoraSum")) + dora);
        if (Session.get("north_riichi") === true) {
            Session.set("northPlayerRiichisWon", Number(Session.get("northPlayerRiichisWon")) + 1);
            Session.set("northPlayerRiichiEV", Number(Session.get("northPlayerRiichiEV")) + seatDeltas["north"]);
        }
    }

    if (loserWind === Constants.EAST || paoWind === Constants.EAST) {
        Session.set("eastPlayerLosses", Number(Session.get("eastPlayerLosses")) + 1);
        Session.set("eastPlayerDealInTotal", Number(Session.get("eastPlayerDealInTotal")) + value / 2);
        if (Session.get("east_riichi") === true) {
            Session.set("eastlayerRiichiEV", Number(Session.get("eastPlayerRiichiEV")) + seatDeltas["east"]);
        }
    } else if (loserWind === Constants.SOUTH || paoWind === Constants.SOUTH) {
        Session.set("southPlayerLosses", Number(Session.get("southPlayerLosses")) + 1);
        Session.set("southPlayerDealInTotal", Number(Session.get("southPlayerDealInTotal")) + value / 2);
        if (Session.get("south_riichi") === true) {
            Session.set("southlayerRiichiEV", Number(Session.get("southPlayerRiichiEV")) + seatDeltas["south"]);
        }
    } else if (loserWind === Constants.WEST || paoWind === Constants.WEST) {
        Session.set("westPlayerLosses", Number(Session.get("westPlayerLosses")) + 1);
        Session.set("westPlayerDealInTotal", Number(Session.get("westPlayerDealInTotal")) + value / 2);
        if (Session.get("west_riichi") === true) {
            Session.set("westlayerRiichiEV", Number(Session.get("westPlayerRiichiEV")) + seatDeltas["west"]);
        }
    } else if (loserWind === Constants.NORTH || paoWind === Constants.NORTH) {
        Session.set("northPlayerLosses", Number(Session.get("northPlayerLosses")) + 1);
        Session.set("northPlayerDealInTotal", Number(Session.get("northPlayerDealInTotal")) + value / 2);
        if (Session.get("north_riichi") === true) {
            Session.set("northlayerRiichiEV", Number(Session.get("northPlayerRiichiEV")) + seatDeltas["north"]);
        }
    }

    if (loserWind != Constants.EAST && winnerWind != Constants.EAST && paoWind === Constants.EAST && Session.get("east_riichi") === true) {
        Session.set("eastPlayerRiichiEV", Number(Session.get("eastPlayerRiichiEV")) - 1000);
    }
    if (loserWind != Constants.SOUTH && winnerWind != Constants.SOUTH && paoWind === Constants.SOUTH && Session.get("south_riichi") === true) {
        Session.set("southPlayerRiichiEV", Number(Session.get("southPlayerRiichiEV")) - 1000);
    }
    if (loserWind != Constants.WEST && winnerWind != Constants.WEST && paoWind === Constants.WEST && Session.get("west_riichi") === true) {
        Session.set("westPlayerRiichiEV", Number(Session.get("westPlayerRiichiEV")) - 1000);
    }
    if (loserWind != Constants.NORTH && winnerWind != Constants.NORTH && paoWind === Constants.NORTH && Session.get("north_riichi") === true) {
        Session.set("northPlayerRiichiEV", Number(Session.get("northPlayerRiichiEV")) - 1000);
    }

    Session.set("free_riichi_sticks", 0);

    pushHand(template,
             Constants.PAO,
             seatDeltas[Constants.EAST],
             seatDeltas[Constants.SOUTH],
             seatDeltas[Constants.WEST],
             seatDeltas[Constants.NORTH],
            {east: Session.get("east_riichi"),
                south: Session.get("south_riichi"),
                west: Session.get("west_riichi"),
                north: Session.get("north_riichi")});

    if (winnerWind === dealerWind)
        Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
    else {
        Session.set("current_bonus", 0);
        Session.set("current_round", Number(Session.get("current_round")) + 1)
    }

    template.riichi_round_history.push({east: Session.get("east_riichi"),
                                        south: Session.get("south_riichi"),
                                        west: Session.get("west_riichi"),
                                        north: Session.get("north_riichi")});
};

function pushHand(template, handType, eastDelta, southDelta, westDelta, northDelta, riichiLog) {
    template.hands.push(
        {
            handType: handType,
            round: Session.get("current_round"),
            bonus: Session.get("current_bonus"),
            points: Session.get("current_points"),
            fu: Session.get("current_fu"),
            dora: Session.get("current_dora"),
            eastDelta: eastDelta,
            southDelta: southDelta,
            westDelta: westDelta,
            northDelta: northDelta,
            riichiLog: riichiLog
        });

    Session.set("east_score", Number(Session.get("east_score")) + eastDelta);
    Session.set("south_score", Number(Session.get("south_score")) + southDelta);
    Session.set("west_score", Number(Session.get("west_score")) + westDelta);
    Session.set("north_score", Number(Session.get("north_score")) + northDelta);

};

function setAllGUIRiichisFalse() {
    Session.set("east_riichi", false);
    Session.set("south_riichi", false);
    Session.set("west_riichi", false);
    Session.set("north_riichi", false);
};

function resetRoundStats() {
    Session.set("current_points", 0);
    Session.set("current_fu", 0);
    Session.set("current_dora", 0);
    Session.set("round_winner", Constants.NO_PERSON);
    Session.set("round_loser", Constants.NO_PERSON);
    Session.set("round_pao_player", Constants.NO_PERSON);

    for (let wind of Constants.WINDS) {
        Session.set(wind + "_riichi", false);
        Session.set(wind + "_tenpai", false);
    }

    $( ".winner_buttons button" ).removeClass( "disabled" );
    $( ".loser_buttons button" ).removeClass( "disabled" );
    $( ".riichi_buttons button" ).removeClass( "disabled" );
    $( ".tenpai_buttons button" ).removeClass( "disabled" );
    $( ".pao_buttons button" ).removeClass( "disabled" );

    $( ".winner_buttons button" ).removeClass( "active" );
    $( ".loser_buttons button" ).removeClass( "active" );
    $( ".riichi_buttons button" ).removeClass( "active" );
    $( ".tenpai_buttons button" ).removeClass( "active" );
    $( ".pao_buttons button" ).removeClass( "active" );

    $( "select.points" ).val(undefined);
    $( "select.fu" ).val(undefined);
    $( "select.dora" ).val(undefined);
    Session.set("input_dora", false);
};

Template.jpn_points.events({
    'change select[name="points"]'(event) {
        Session.set("current_points", event.target.value);
    }
});

Template.jpn_fu.events({
    'change select[name="fu"]'(event) {
        Session.set("current_fu", event.target.value);
    }
});

Template.jpn_dora.events({
    'change select[name="dora"]'(event) {
        Session.set("current_dora", event.target.value);
        Session.set("input_dora",true);
    }
});
