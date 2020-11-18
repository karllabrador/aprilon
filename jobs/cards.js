const path = require('path');
const fs = require('fs');
const sprintf = require('sprintf-js').sprintf;
const SteamID = require('steamid');
const config = require(path.join(__dirname, '..', 'config', 'config'));
const http = require('http');

const steam_api_query_url = 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0001/?key=%s&steamids=%s&format=json';
const debug = config['cards']['debug'];
const cards = [];

/**
 * Card object to store data
 * @param name their name
 * @param steamid their steamid
 * @constructor
 */
function Card(name, steamid) {
    // From reference
    this.name = name;
    this.steamid = steamid;
    this.desc = undefined;
    this.discord = undefined;

    // Steam
    this.steam_name = undefined;
    this.steam_state = undefined;
    this.steam_avatar_url = undefined;
    this.friendid = undefined;

    Object.defineProperty(this, "friendid", {
       get() {
           let sid = new SteamID(this.steamid);
           return ((sid.isValid()) ? sid.getSteamID64() : null);
       }
    });
}

/**
 * Reads the contributors reference file
 * @returns {any} parsed JSON as a string
 */
function getReference() {
    let filePath = config['cards']['reference_file'] || path.join(__dirname, '..', 'config', 'contributors.json');
    let loadedReference;

    try {
        loadedReference = () => fs.readFileSync(filePath);
    } catch (err) {
        console.log(err);
    }

    return JSON.parse(loadedReference().toString());
}

/**
 * Retrieves our Steam API key from the config
 * @returns {*}
 */
function getSteamAPIKey() {
    return config['cards']['steam_api_key'];
}

/**
 * Builds the query url for our Steam API call
 * @returns {string|void}
 */
function getQueryURL() {
    if (cards.length < 1) return console.log('Cards is empty -> may not have been initialized?');

    let steam_api_key = getSteamAPIKey();
    if (!steam_api_key) return console.log('Steam API key not present -> check your config');

    let ids = '';
    cards.forEach((card) => { ids += card.friendid + ','; });

    return sprintf(steam_api_query_url, steam_api_key, ids);
}

/**
 * Initializes the card objects
 */
function initCards() {
    if (cards.length !== 0) return;

    let contributors = getReference();

    contributors.forEach((contributor) => {
        let name = contributor['name'];
        let steamid = contributor['steamid'];

        let card = new Card(name, steamid);

        card.desc = ((contributor['desc']) ? contributor['desc'] : '');
        card.discord = ((contributor['discord']) ? contributor['discord'] : '');

        cards.push(card);
    });
}

/**
 * Finds a Card object based on their friend or steamid
 * @param id either a friendid or a steamid
 * @returns {null} a Card object if found, null if not found
 */
function findCard(id) {
    let isFriendId = (!id.includes('STEAM_'));
    let cardObj = null;

    cards.forEach((card) => {
       if (isFriendId) {
           if (card.friendid === id) {
               if (debug) console.log(`Found ${id} -> ${card.friendid}`);
               cardObj = card;
           }
       } else {
           if (card.steamid === id) {
               if (debug) console.log(`Found ${id} -> ${card.steamid}`);
               cardObj = card;
           }
       }
    });

    return cardObj;
}

/**
 * Generates a contributors.json file
 */
function generate() {
    initCards();
    let url = getQueryURL();

    // Steam API call
    http.get(url, function(res) {
         if (debug) console.log('Sent http request: ' + url);

         let chunks = [];

         res.on('data', function(data) {
             chunks.push(data);
         });

         res.on('end', function() {
             let data = Buffer.concat(chunks);
             let parsed;

             try {
                 parsed = JSON.parse(data.toString());
             } catch (err) {
                 if (err) return console.log('Cards experienced error: ' + err);
             }


             let players = parsed['response']['players']['player'];

             Array.from(players).forEach((player) => {
                 if (debug) console.log(`Player -> ${player['personaname']}`)

                 let friendid = player['steamid']; // in a Steam API call the steamid is actually the friendid
                 let personaname = player['personaname'];
                 let personastate = player['personastate'];
                 let avatarmedium = player['avatarmedium'];

                 // Apply to card
                 let card = findCard(friendid);
                 card.steam_name = personaname;
                 card.steam_state = personastate;
                 card.steam_avatar_url = avatarmedium;
             });

             write();
         });
    });
}

/**
 * Stringifies the cards array and writes it to a public file
 */
function write() {
    let json = JSON.stringify(cards);

    fs.writeFile(path.join(__dirname, '..', 'public', 'cards.json'), json, function(err) {
       if (err) return console.log(err);
       console.log('Wrote cards to file');
    });
}

exports.generate = function() {
    console.log('Generating cards...');
    generate();
};