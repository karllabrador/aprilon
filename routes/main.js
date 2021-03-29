const express = require('express');
const router = express.Router();
const path = require('path');
const config = require(path.join(__dirname, '..', 'config', 'config'));

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index', {
        title: 'Aprilon — gaming community (now defunct)'
    });
});

/* GET download */
const worlds = config['minecraft_worlds'];

router.get('/download/world-:worldId', (req, res) => {
    const worldId = req.params.worldId;
    const world_url = worlds[worldId];

    world_url
        ? res.redirect(world_url)
        : res.status(400).send('Minecraft World is missing in the config');
});

/* GET discord */
const discord_url = config['discord'];

router.get('/discord', (req, res) => {
    discord_url
        ? res.redirect(discord_url)
        : res.status(400).send('Discord URL is missing in the config.');
});

module.exports = router;
