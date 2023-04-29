import Players from './Players';
import Constants from './Constants';
import GameTypeUtils from './utils/GameTypeUtils';

export default class EloCalculator {
    constructor (n, exp, placingAdjustments, game, gameType) {
        this.n = n;
        this.exp = exp;
        this.placingAdjustments = placingAdjustments;
        this.game = game;
        this.gameType = gameType;
    }

    // PUBLIC: Return ELO delta for a player
    eloChange (player) {
        let index, gamesPlayed, score;
        if (player === this.game.east_player) {
            index = 0;
            score = this.game.east_score;
        }
        else if (player === this.game.south_player) {
            index = 1;
            score = this.game.south_score;
        }
        else if (player === this.game.west_player) {
            index = 2;
            score = this.game.west_score;
        }
        else {
            index = 3;
            score = this.game.north_score;
        }

        let fieldElo = 0.0;
        fieldElo += this.getPlayerElo(this.game.east_player);
        fieldElo += this.getPlayerElo(this.game.south_player);
        fieldElo += this.getPlayerElo(this.game.west_player);
        fieldElo += this.getPlayerElo(this.game.north_player);
        fieldElo = fieldElo / 4;

        let eastScore = this.game.east_score;
        let southScore = this.game.south_score;
        let westScore = this.game.west_score;
        let northScore = this.game.north_score;

        let adjustments = [0,0,0,0];
        let adjustedScores = [];

        for (let index in this.placingAdjustments) {
            let nextBestScore = Math.max(eastScore, southScore, westScore, northScore);

            switch (nextBestScore) {
                case eastScore:
                    adjustments[0] = this.placingAdjustments[index];
                    eastScore = Number.NEGATIVE_INFINITY;
                    break;
                case southScore:
                    adjustments[1] = this.placingAdjustments[index];
                    southScore = Number.NEGATIVE_INFINITY;
                    break;
                case westScore:
                    adjustments[2] = this.placingAdjustments[index];
                    westScore = Number.NEGATIVE_INFINITY;
                    break;
                case northScore:
                    adjustments[3] = this.placingAdjustments[index];
                    northScore = Number.NEGATIVE_INFINITY;
                    break;
            };
        }
        let elo_difference = fieldElo - this.getPlayerElo(player);
        let first_calc = (score - 25000 + adjustments[index]) / 1000;
        let correlation = 0.24;
        let k_factor = 40

        return (first_calc * correlation + elo_difference / k_factor);
    }

    // Return expected scores for players based off table's ELO's
    expectedScores() {
        let rawExpectedScoreSum = 0.0;
        let rawExpectedScores = [];
        let expectedScores = [];

        rawExpectedScores.push(this.rawExpectedScore(this.game.east_player));
        rawExpectedScores.push(this.rawExpectedScore(this.game.south_player));
        rawExpectedScores.push(this.rawExpectedScore(this.game.west_player));
        rawExpectedScores.push(this.rawExpectedScore(this.game.north_player));

        rawExpectedScoreSum = rawExpectedScores.reduce( (a,b) => a+b);

        for (let index in rawExpectedScores) {
            expectedScores.push(rawExpectedScores[index] / rawExpectedScoreSum);
        }

        return expectedScores;
    }

    // Formula for expected score
    // see: https://github.com/Victorree/MahjongEloSystem/blob/master/src/com/company/model/EloCalculator.java
    rawExpectedScore (player) {
        return (1 / (1 + Math.pow(this.exp, (this.fieldElo(player) - this.getPlayerElo(player)) / this.n )));
    }

    // Return normalized, adjusted scores in [E,S,W,N] order
    adjustedScores() {
        let rawScoreSum = 0.0;
        let rawScores = [];
        let adjustments = [0, 0, 0, 0];
        let adjustedScores = [];

        let eastScore = this.game.east_score;
        let southScore = this.game.south_score;
        let westScore = this.game.west_score;
        let northScore = this.game.north_score;

        rawScores.push(this.game.east_score);
        rawScores.push(this.game.south_score);
        rawScores.push(this.game.west_score);
        rawScores.push(this.game.north_score);

        //Add score adjustment for 1st, 2nd, 3rd, 4th place
        //Is this too crude? Replace this if you have a better way
        for (let index in this.placingAdjustments) {
            let nextBestScore = Math.max(eastScore, southScore, westScore, northScore);

            switch (nextBestScore) {
            case eastScore:
                adjustments[0] = this.placingAdjustments[index];
                eastScore = Number.NEGATIVE_INFINITY;
                break;
            case southScore:
                adjustments[1] = this.placingAdjustments[index];
                southScore = Number.NEGATIVE_INFINITY;
                break;
            case westScore:
                adjustments[2] = this.placingAdjustments[index];
                westScore = Number.NEGATIVE_INFINITY;
                break;
            case northScore:
                adjustments[3] = this.placingAdjustments[index];
                northScore = Number.NEGATIVE_INFINITY;
                break;
            };
        }

        rawScoreSum = rawScores.reduce( (a,b) => a+b);

        for (let index in rawScores) {
            adjustedScores.push((rawScores[index] + adjustments[index]) / rawScoreSum);
        }

        return adjustedScores;
    }

    // Average ELO of all players except (player)
    fieldElo (player) {
        let fieldElo = 0.0;

        if (this.game.east_player !== player)
            fieldElo += this.getPlayerElo(this.game.east_player);
        if (this.game.south_player !== player)
            fieldElo += this.getPlayerElo(this.game.south_player);
        if (this.game.west_player !== player)
            fieldElo += this.getPlayerElo(this.game.west_player);
        if (this.game.north_player !== player)
            fieldElo += this.getPlayerElo(this.game.north_player);
        return fieldElo / 3;
    }

    // Return a player's ELO
    getPlayerElo (player) {
        let criteria = {}
        switch (this.gameType) {
        case Constants.GAME_TYPE.HONG_KONG:
            criteria["hongKongLeagueName"] = player;
            break;
        case Constants.GAME_TYPE.JAPANESE:
            criteria["japaneseLeagueName"] = player;
            break;
        case Constants.GAME_TYPE.UPPER_JAPANESE:
            criteria["japaneseLeagueName"] = player;
            break;
        }

        return Number(GameTypeUtils.getPlayer(this.gameType, criteria).elo);
    }
};
