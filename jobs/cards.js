const path = require('path');
const fs = require('fs');
const sprintf = require('sprintf-js').sprintf;
const SteamID = require('steamid');
const config = require(path.join(__dirname, '..', 'config', 'config'));
const http = require('http');
const parser = require('xml2js');

const debug = config['cards']['debug'];

let contributors = null;

function loadContributorsRef() {
    let loadedReference = () => fs.readFileSync(path.join(__dirname, '..', 'config', 'contributors.json'));
    contributors = JSON.parse(loadedReference().toString());
}

function toFriendId(steamid) {
    const sid = new SteamID(steamid);
    return ((sid.isValid()) ? sid.getSteamID64() : null);
}

function find(players, steamid) {
    if (players) {
        Array.from(players).forEach((p) => {
           if (p['steamid'] === toFriendId(steamid)) return p;
        });
    }

    return null;
}

function write(players) {
    // Steam API returns data in random order, we have to place it in correct order
    let cards = [];

    Array.from(contributors).forEach((c) => {
        let steamid = c['steamid'];
        let data = find(players, steamid);

        // Setup card data
        let card = Array.of(c).concat(data);
        cards.push(card);
    });

    // Write to file
    let json = JSON.stringify(cards);
    fs.writeFile(path.join(__dirname, '..', 'public', 'cards.json'), json, function(err) {
        if (err) return console.log(err);
        console.log('Wrote cards to file -> cards.json');
    });

}

exports.generate = function() {
    loadContributorsRef();
    let steam_api_key = config['cards']['steam_api_key'];
    let friendIds = '';

    // Only continue if we have a Steam API key
    if (!steam_api_key) return;

    // Create string of FriendIds for our API call
    Array.from(contributors).forEach((c) => {
       let fid = toFriendId(c['steamid']);
       console.log('friendid -> ' + fid);

       friendIds += sprintf('%s,', fid);
    });

    // Steam API call
    let url = sprintf('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0001/?key=%s&steamids=%s&format=json', steam_api_key, friendIds);

    http.get(url, function(res) {
        if (debug) console.log('Sent http request: ' + url);

        let chunks = [];

        res.on('data', function(data) {
           chunks.push(data);
        });

        res.on('end', function() {
            let data = Buffer.concat(chunks);
            let parsed = JSON.parse(data.toString());
            let players = parsed['response']['players']['player'];

            Array.from(players).forEach((p) => {
                console.log('Player -> ' + p['personaname']);
            });

            write(players);
        });
    });
}