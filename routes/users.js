var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var express = require('express');
var passport = require('passport');
var jwt = require('express-jwt');
var async = require('async');
var crypto = require('crypto');
var path = require('path');
var flash = require('express-flash')
var router = express.Router();

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

var User = mongoose.model('User');

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', function(req, res, next){
    if(!req.body.username || !req.body.password || !req.body.password2){
        return res.status(400).json({message: 'Please fill out all the fields'});
    }
    if(req.body.password != req.body.password2){
        return res.status(400).json({message: 'Passwords do not match'});
    } 

    User.findOne({ username: req.body.username }, function(err, user) {
        if (user.length!=0) {
            return res.status(400).json({message: 'An account with this email already exists.'});
        }
    });
    
    var user = new User();
    
    user.username = req.body.username;

    user.setPassword(req.body.password);
    
    user.save(function (err){
        if(err){ return next(err); }
        var tokenObj =  user.generateJWT();
        return res.json({token:  user.generateJWT()});
    });
});

router.post('/login', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all the fields'});
    }
    passport.authenticate('local', function(err, user, info){
        if(err){ return next(err); }
        
        if(user){
            return res.json({token: user.generateJWT()});
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});

router.post('/forgot', function(req, res, next) {
        async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var emailToken = buf.toString('hex');
                    done(err, emailToken);
                });
            },
            function(emailToken, done) {
                User.findOne({ username: req.body.username }, function(err, user) {
                    if (!user) {
                        return res.status(400).json({message: 'No account with that email address exists.'});
                    }

                    user.resetPasswordToken = emailToken;
                    user.resetPasswordExpires = Date.now() + 3600000; 

                    user.save(function(err) {
                        done(err, emailToken, user);
                    });
                });
            },
            function(emailToken, user, done) {
				var transport = nodemailer.createTransport('SMTP', {
                    service: 'Mailgun',
                    auth: {
                        user: 'postmaster@mg.vogollc.com',
                        pass: '9b6a36d2f6ea82358f6ef7045ca4906e'
                    }
                });
                var mailOptions = {
					transport : transport, 
                    sender: 'noreply@jaredcsullivan.com',
                    to: user.username,
                    subject: 'Demo App password reset',
                    html: 'You are receiving this because you (or someone else) have requested the reset of the password for your demo app account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          '<a href=http://' + req.headers.host + '/reset/' + emailToken + '>http://' + req.headers.host + '/reset/' + emailToken + '</a> \n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged. This email was automatically generated. \n Please do not reply to this emal.'
                };
                
              nodemailer.sendMail(mailOptions, function(err) {
                return res.status(200).json({message: 'An e-mail has been sent to ' + user.username + ' with instructions on how to reset your password.'});
                done(err, 'done');
              });
          }
      ]);
    });

    router.get('/reset/:emailToken', function(req, res) {
        User.findOne({ resetPasswordToken: req.params.emailToken, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            return res.status(400).json({message: 'Password reset token is invalid or has expired.'});
		    return res.redirect('/');
        }
            res.render('reset', {
                title: 'Change Password'
            });
        });
    });
	
	router.post('/confirmreset', function(req, res) {
		var requestObj = JSON.stringify(req.body, null, 4);
		console.log('Line 153' + requestObj);
		if(!req.body.password || !req.body.password2){
        	return res.status(400).json({message: 'Please fill out all the fields'});
    	}
		if(req.body.password != req.body.password2){
        	return res.status(400).json({message: 'Passwords do not match'});
    	} 
		if(!req.body.resetPasswordToken){
        	return res.status(400).json({message: 'Password reset token is invalid or has expired'});
    	} 

  		async.waterfall([
    		function(done) {
		console.log('email token: ' + req.body.resetPasswordToken);

      			User.findOne({ resetPasswordToken: req.body.resetPasswordToken}, function(err, user) {

				if (!user) {
					return res.redirect('back');
				}
					
        		user.setPassword(req.body.password);
        		user.resetPasswordToken = undefined;
        		user.resetPasswordExpires = undefined;
					

        		user.save(function(err) {
          			req.logIn(user, function(err) {
            			done(err, user);
          			});
        		});
      		});
    	}

  		], function(err) {
    	res.redirect('/');
  		} 
	  );
	});

module.exports = router;