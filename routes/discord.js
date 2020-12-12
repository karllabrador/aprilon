const path = require('path');
const express = require('express');
const router = express.Router();
const config = require(path.join(__dirname, '..', 'config', 'config'));

// Maybe I want to do some more here than just redirecting

const discord_invite_url = config['discord'];

/* GET req */
router.get('/', function(req, res, next) {
    if (discord_invite_url) {
        res.writeHead(307, { Location: discord_invite_url });
        res.send();
    }
    else {
        res.writeHead(400, 'Bad Request', { 'content-type': 'text/plain' });
        res.end('This request doesn\'t seem to be working. You should let somebody know...');
    }
});

module.exports = router;
