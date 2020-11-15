const express = require('express');
const router = express.Router();
const path = require('path')

/* GET users listing. */
router.get('/get', function(req, res, next) {
  let cards = require(path.join(__dirname, '..', 'jobs', 'cards'));

  cards.generate();

  res.send('respond with a resource');
});

module.exports = router;
