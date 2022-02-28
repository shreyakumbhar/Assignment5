const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const User = require('../models/user');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/**
 * Instead of cookies passport will serve JSON web token. These need to be sent directly
 * by the client and won't be saved in the cookies.
*/
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.secretOrKey
},
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({ _id: jwt_payload._id }, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));



// returns a hashed JSON web token based on the user Id and the set secret
function getToken(userId) {
    return jwt.sign(userId, config.secretOrKey, { expiresIn: 360000 });
};

// Middleware to check whether the request comes from a registered user.
const verifyUser = passport.authenticate('jwt', { session: false });

// Middleware to check whether the request comes from an admin.
function verifyAdmin(req, res, next) {
    if (req.user.admin === true) {
        return next();
    }
    else {
        err = new Error('You are not allowed to perform this operation!');
        err.status = 403;
        return next(err);
    }
}

module.exports = {
    getToken,
    verifyUser,
    verifyAdmin
}