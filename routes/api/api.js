const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const router = require("express").Router();
const userController = require("../../controller/userController");
const passport = require("passport");
const { default: axios } = require("axios");

const store = new MongoDBStore({
  uri: process.env.MONGO_URL,
  collection: "sessions",
  autoRemove: "interval",
  autoRemoveInterval: 60,
});

store.on("error", function (error) {
  console.log(error);
});
// router.set("trust proxy", 1);

router.use(
  session({
    secret: process.env.SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
      secure: true,
      maxAge: 60 * 60 * 1000,
      creationDate: Date.now(),
    },
    store: store,
  })
);

router.use(passport.initialize());
router.use(passport.session());

require("../../config/userAuthStrat");
const auth = require("../../middleware/userAuth");

router.get("/", (req, res) => {
  res.json({ message: "welcome to my Blog API" });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("login", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      res.json({ message: "Authentication successful", user });
    });
  })(req, res, next);
});

router.post("/login-failed", (req, res) => {
  res.send("login failed");
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.USER_ORIGIN}/failed`,
  }),
  async (req, res) => {
    try {
      const accessToken = req.accessToken;
      if (!accessToken) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`
      );
      const tokenInfo = response.data;

      // Validate the tokenInfo as needed
      if (tokenInfo.aud === process.env.GOOGLE_CLIENT_ID) {
        res.redirect(`${process.env.USER_ORIGIN}/`);
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get("/posts", userController.getPosts);

router.get("/posts/:id", userController.getPost);

router.post(
  "/posts/:id/like",
  auth.isAuthenticatedGoog,
  userController.likeHandler
);

router.post(
  "/posts/:id/comment",
  auth.isAuthenticatedGoog,
  userController.comment
);

router.post(
  "/getLoggedInUser",
  auth.isAuthenticatedGoog,
  userController.getLoggedInUser
);

const noCacheMiddleware = (req, res, next) => {
  console.log("no cache");
  res.setHeader("Cache-Control", "no-cache, no-store");
  next();
};

router.get(
  "/session",
  noCacheMiddleware,
  auth.isAuthenticatedGoog,
  userController.getCurrentUser
);

router.post("/logout", auth.isAuthenticatedGoog, userController.logout);

router.post("/register", userController.createUser);

module.exports = router;
