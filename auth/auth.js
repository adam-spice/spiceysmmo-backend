const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const UserModel = require('../models/UserModel');

// handle user registration
passport.use(
  'signup',
  new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const { username } = req.body;
        const user = await UserModel.create({ email, password, username });
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

// handle user login
passport.use(
  'login',
  new localStrategy.Strategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await UserModel.findOne({ email });
        if (!user) {
          return done(new Error('user not found'), false);
        }
        const valid = await user.isValidPassword(password);
        if (!valid) {
          return done(new Error('invalid password'), false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);
