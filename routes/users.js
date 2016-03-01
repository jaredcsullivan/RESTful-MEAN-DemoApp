var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var passport = require('passport');
var jwt = require('express-jwt');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

var User = mongoose.model('User');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* POST for creating a new User */
router.post('/register', function(req, res, next){
    if(!req.body.username || !req.body.email || !req.body.fname || !req.body.lname || !req.body.password || !req.body.password2){
        return res.status(400).json({message: 'Please fill out all the fields'});
    }
    if(req.body.password != req.body.password2){
        return res.status(400).json({message: 'Passwords do not match'});
    } 
    
    var user = new User();
    
    user.username = req.body.username;
    
    user.fname = req.body.fname;

    user.lname = req.body.lname;

    user.setEmail(req.body.email);

    user.setPassword(req.body.password);
    
    user.save(function (err){
        if(err){ return next(err); }
        
        return res.json({token: user.generateJWT()})
    });
});

/* POST for authenticating a User */
router.post('/login', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all the fields'});
    }
    passport.authenticate('local', function(err, user, info){
        if(err){ return next(err); }
        
        if(user){
            return res.json({token: user.generateJWT()});
            return res.redirect('/main/');
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});

module.exports = router;