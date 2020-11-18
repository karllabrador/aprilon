const express = require('express');
const router = express.Router();

const worlds = {
  1: 'https://aprilon.org/gamefiles/a=mc/world_20120621.tar.gz',
  2: 'https://aprilon.org/gamefiles/a=mc/world_20150218_1509.tar.gz'
}

// TODO: Eventually I want to track download clicks

/* GET world download */
router.get('/world-:WorldId', function(req, res, next) {
  let world_id = req.params.WorldId;
  let url = worlds[world_id];

  if (url) {
    res.writeHead(307, { Location: url });
    res.send();
  }
  else {
    res.writeHead(400, 'Bad Request', { 'content-type': 'text/plain'});
    res.end('Could not find the download you were looking for');
  }
});

module.exports = router;
