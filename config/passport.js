const passport = require("passport");
const User = require("../models/User");

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStartegy = require("passport-facebook").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "development"
          ? "/api/users/login/google/callback"
          : "https://techstore-api-3jmr.onrender.com/api/users/login/google/callback",
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
      callbackURL:
        process.env.NODE_ENV === "development"
          ? "/api/users/login/facebook/callback"
          : "https://techstore-api-3jmr.onrender.com/api/users/login/facebook/callback",
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
