const express = require('express');
// const router = express.Router();
var router = express.Router({mergeParams: true}); //merge params is important!

router.get('/', function(req, res){
    // res.send('CARD PAGE!');
    res.render('card');
});



module.exports = router;