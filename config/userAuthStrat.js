const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const GoogleStrat = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET_KEY,
    callbackURL: "http://localhost:3000/api/google/callback",
    passReqToCallback: true,
  },
  async (req, accessToken, refreshToken, profile, cb) => {
    try {
      const foundUser = await User.findOne({ email: profile._json.email });
      req.accessToken = accessToken;

      if (foundUser) {
        req.user = {
          user: foundUser,
        };
        return cb(null, foundUser);
      }

      const usr = new User({
        _id: new mongoose.Types.ObjectId(),
        oAuth: true,
        sub: profile._json.sub,
        name: profile._json.name,
        email: profile._json.email,
        profileImg: profile._json.picture,
      });

      await usr.save();
      return cb(null, usr);
    } catch (error) {
      console.log(error);
    }
  }
);

const verifyCallbackFunctionLocal = async (email, password, done) => {
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return done(null, false, { message: "Incorrect Email" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return done(null, false, { message: "Incorrect password" });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
};

const localStrat = new LocalStrategy(
  { usernameField: "email", passwordField: "password" },
  verifyCallbackFunctionLocal
);

passport.use(GoogleStrat);
passport.use("login", localStrat);

passport.serializeUser((user, done) => {
  done(null, user._id); // Store only the user ID in the session
});

passport.deserializeUser(async (id, done) => {
  try {
    const foundUser = await User.findById(id);
    done(null, foundUser); // Attach the user object to req.user
  } catch (err) {
    done(err);
  }
});
