/**
 * User schema. Password and email are added by passportLocalMongoose.
 * The email needs to be unique since it will be used as the identifier of the user.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    },
    activated: {
        type: Boolean,
        default: true
    }
});

// Email and password properties are added by the passportLocalMongoose module
User.plugin(passportLocalMongoose, { usernameField : 'email' });

module.exports = mongoose.model('User', User);