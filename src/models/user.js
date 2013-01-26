var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    config = require('../config.js'),
    schema = new mongoose.Schema({
        email: { type: String, require: true, index: { unique: true }, trim: true },
        password: { type: String, require: true },
		created: { type: Date, require: true, default: Date.now },
        author: { type: Boolean, require: true }
    });

schema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')){
        return next();
    }

    bcrypt.genSalt(config.security.saltWorkFactor, function(err, salt) {
        if (err){
            return next(err);
        }

        // hash the password
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err){
                return next(err);
            }

            user.password = hash;

            return next();
        });
    });
});

schema.methods.validatePassword = function(input, cb) {
    bcrypt.compare(input, this.password, function(err, isMatch) {
        if (err){
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('user', schema);