const passport = require("passport");
const User = require("../models/User");

const localStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStartegy = require("passport-facebook").Strategy;

passport.use(
  new localStrategy(async (username, password, done) => {
    const user = await User.findOne({ username });

    try {
      if (!user) throw new Error("Username is Invalid!");
      if (!(await user.matchPassword(password)))
        throw new Error("Password is Invalid!");

      done(null, user);
    } catch (error) {
      done(error.message, false);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/users/login/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ providerId: profile.id });

        if (user) {
          done(null, user);
        } else {
          user = await User.create({
            username: profile.displayName,
            provider: profile.provider,
            providerId: profile.id,
          });
          done(null, user);
        }
      } catch (error) {
        console.log(error);
      }
    }
  )
);

passport.use(
  new FacebookStartegy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: "/api/users/login/facebook/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ providerId: profile.id });

        if (user) {
          done(null, user);
        } else {
          user = await User.create({
            username: profile.displayName,
            provider: profile.provider,
            providerId: profile.id,
          });
          done(null, user);
        }
      } catch (error) {
        console.log(error);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
