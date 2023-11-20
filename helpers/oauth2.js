const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv/config');
const User = require('../models/user')
const mongoose = require('mongoose');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production'
    ? 'https://https://web-electronic-device-shop.onrender.com/auth/google/callback'
    : 'http://localhost:5001/auth/google/callback', //link hứng res từ gg
},
    async function (accessToken, refreshToken, profile, cb) {
        if (profile?.id) {
            let userId;
            try {
                userId = mongoose.Types.ObjectId(`${profile.id}abc`);//đủ 24 bit
            } catch (error) {
                console.error('Invalid ObjectId:', error);
                return cb(error, null);
            }
            const response = await User.findOne({ _id: userId });
            if (response) {
                return cb(null, response);
            }

            const user = new User({
                _id: userId,
                email: profile.emails[0]?.value,
                name: profile.name.givenName,
                passwordHash: 'abcd',
                phone: '1234'
            })
            await user.save()
            return cb(null, user);
        }
        return cb(new Error('No profile ID available'), null);
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});