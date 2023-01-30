import Chart from 'chart.js/auto';
import {JapaneseHands, UpperJapaneseHands, HongKongHands} from '../../api/GameDatabases';
import './EloGraph.html';

export default class DataRetriever {
    constructor (name,gameType, canvas) {
        this.gameType = gameType;
        this.canvas = canvas;
        if (gameType === "Riichi") {
            this.name = name;
            this.games = JapaneseHands.find(
                {$and:
                    [{ $or: [{ east_player: name},
                        { south_player: name},
                        { west_player: name},
                        { north_player: name}] },
                      {east_elo_after_game: {$exists:true}}
                    ]} );
        } else if (gameType === "Upper League") {
            this.name = name;
            this.games = UpperJapaneseHands.find(
                {$and:
                        [{ $or: [{ east_player: name},
                                { south_player: name},
                                { west_player: name},
                                { north_player: name}] },
                            {east_elo_after_game: {$exists:true}}
                        ]} );
        } else {
            this.name = name;
            this.games = HongKongHands.find({ $or: [{ east_player: name}, { south_player: name}, { west_player: name}, { north_player: name}] });
        }
    }
    getChart() {
        const data = [];
        this.games.forEach(game => data.push(game));
        if (data.length === 0) {
            return window.alert("There are no games!");
        }
        return new Chart(this.canvas,
            {
                type: 'line',
                data: {
                    labels: data.map(game => this.timestampToDate(game.timestamp)),
                    datasets: [
                        {
                            label: 'Elo',
                            data: data.map(game => this.getEloFromGame(game))
                        }
                    ]
                },
                options: {
                    scales: {
                        x: {
                            title: {
                                color: 'blue',
                                display: true,
                                text: 'Date',
                                font: {
                                    size: 20
                                }
                            }
                        },
                        y: {
                            title: {
                                color: 'blue',
                                display: true,
                                text: 'Elo',
                                font: {
                                    size: 20
                                }
                            }
                        }
                    }
                }
            }
        );
    }
    timestampToDate(timestamp) {
        const date = new Date(timestamp);
        let minutes = date.getMinutes();
        let hours = date.getHours();
        let day = date.getDate();
        let month = date.getMonth()+1;
        let time = [day, minutes];
        for (let i in time) {
            if (time[i] < 10) {
                time[i] = "0" + time[i];
            }
        }
        return month + "/" + time[0] + " " + hours + ":" + time[1];
    }
    getEloFromGame(game) {
        if (game.east_player === this.name) {
            return game.east_elo_after_game;
        } else if (game.south_player === this.name) {
            return game.south_elo_after_game;
        } else if (game.west_player === this.name) {
            return game.west_elo_after_game;
        } else if (game.north_player === this.name) {
            return game.north_elo_after_game;
        }
    }
};


