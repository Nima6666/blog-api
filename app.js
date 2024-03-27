var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

require("dotenv").config();
require("./db/databaseConnection");

const apiRouter = require("./routes/api/api");
const adminROuter = require("./routes/admin");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const adminCors = {
  origin: process.env.ADMIN_ORIGIN,
};

const userCors = {
  origin: process.env.USER_ORIGIN,
  credentials: true,
};

app.use("/api", cors(userCors), apiRouter);
app.use("/admin", cors(adminCors), adminROuter);

app.get("/", (req, res) => {
  res.json({ message: "welcome to my server" });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
