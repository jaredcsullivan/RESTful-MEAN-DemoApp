var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
    username : {type: String, unique: true},
    fname: {type: String},
    lname: {type: String},
    email : {type: String, lowercase: true, unique: true},
    hash: String,
    salt: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

UserSchema.methods.setEmail = function(email) {
    
    //TODO check for valid email
    this.email = email;
};

UserSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    
    return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {

    // set expiration to 60 days
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    
    return jwt.sign({
        _id: this._id,
        username: this.username,
        fname: this.fname,
        lname: this.lname,
        email: this.email,
        exp: parseInt(exp.getTime() / 1000),
    }, 'SECRET');
};

mongoose.model('User', UserSchema);