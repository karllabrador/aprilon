const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Aprilon — gaming community (now defunct)'
    });
});

module.exports = router;
