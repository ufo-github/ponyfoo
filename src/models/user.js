var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    crypto = require('crypto'),
    config = require('../config.js'),
    schema = new mongoose.Schema({
        email: { type: String, require: true, index: { unique: true }, trim: true },
        password: { type: String, require: true },
        created: { type: Date, require: true, default: Date.now },
        blogger: { type: Boolean, require: true },
        displayName: { type: String },
        facebookId: { type: String },
        githubId: { type: String },
        googleId: { type: String },
        website: {
            title: { type: String },
            url: { type: String }
        },
        bio: { type: String }
    },{ id: false, toObject: { getters: true }, toJSON: { getters: true } });

schema.virtual('gravatar').get(function(){
    var text = this.email,
        hash = crypto.createHash('md5').update(text).digest('hex');

    return config.avatar.url + hash + config.avatar.query;
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
    if(input === null || input === undefined || this.password === null || this.password === undefined){
        process.nextTick(function(){
            cb(null,false);
        });
        return;
    }

    bcrypt.compare(input, this.password, function(err, isMatch) {
        if (err){
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('user', schema);