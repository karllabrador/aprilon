const path = require('path');
const fs = require('fs');
const sprintf = require('sprintf-js').sprintf;
const config = require(path.join(__dirname, '..', 'config', 'config'));
const http = require('http');
const SteamID = require('steamid');
const Card = require('./card');

const STEAM_API_QUERY_URL = 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=%s&steamids=%s&format=json';
const STEAM_API_KEY = config['cards']['steam_api_key'];

class Cards {
    /**
     * Constructor
     * @param referenceFile relative file path to the reference JSON file
     * @param outputFile relative output file path for produced JSON
     */
    constructor(referenceFile, outputFile) {
        this.cards = [];
        this.referenceFile = referenceFile;
        this.outputFile = outputFile;
    }

    /**
     * Builds the Steam API query URL
     * @returns {string|void}
     */
    getQueryURL() {
        if (this.cards.length === 1)
            return console.error('Cards have not been initialized yet');

        if (!STEAM_API_KEY)
            return console.error('Steam API key is undefined');

        const joinedIds = this.cards
            .map(e => e.friendid)
            .join();

        return sprintf(STEAM_API_QUERY_URL, STEAM_API_KEY, joinedIds);
    }

    /**
     * Fills the cards array with data from the reference file
     */
    init() {
        if (this.cards.length !== 0) return;

        const contributors = this.loadCont();

        contributors.forEach(cont => {
            const name = cont.name;
            const steamid = cont.steamid;

            const card = new Card(name, steamid);

            card.desc = cont.desc ? cont.desc : '';
            card.discord = cont.discord ? cont.discord : '';
            card.github = cont.github ? cont.github : '';

            this.cards.push(card);
        });
    }

    /**
     * Loads the reference file and parses the JSON content
     * @returns {any}
     */
    loadCont() {
        const filePath = this.referenceFile || path.join(__dirname, '..', 'config', 'contributors.json');
        let contents;

        try {
            contents = () => fs.readFileSync(filePath);
        } catch (err) {
            console.error(err);
        }

        return JSON.parse(contents().toString());
    }

    /**
     * Writes the cards array as JSON data to the output file
     */
    write() {
        const outputPath = this.outputFile || path.join(__dirname, '..', 'public', 'data', 'cards.json');

        fs.writeFile(outputPath, JSON.stringify(this.cards), err => {
            if (err)
                return console.error(err);

            console.log('Wrote cards to file');
        });
    }

    /**
     * Runs the Steam API request and fetches profile data, then stores it in Card objects
     */
    run() {
        this.init();
        const queryURL = this.getQueryURL();

        http.get(queryURL, (res) => {
            const chunks = [];

            res.on('data', (data) => {
                chunks.push(data);
            });

            res.on('end', () => {
                const data = Buffer.concat(chunks);
                let playerdata; // playerdata

                try {
                    playerdata = JSON.parse(data.toString());
                } catch (err) {
                    console.error('Error fetching playerdata', err);
                }

                playerdata = playerdata.response.players;

                playerdata.forEach(ply => {
                    const friendid = ply.steamid;
                    const personaname = ply.personaname;
                    const avatarmedium = ply.avatarmedium;

                    const personastate = ply.gameid ? 7 : ply.personastate;

                    // Set data to card
                    const card = this.cards.find(e => e.friendid === friendid);
                    if (card) {
                        card.steam_name = personaname;
                        card.steam_state = personastate;
                        card.steam_avatar_url = avatarmedium;
                    }
                });

                this.write();
            })
        });
    }
}

module.exports = Cards;