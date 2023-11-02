const express = require("express");
const route = express.Router();
const passport = require("passport");
require("dotenv").config();

route.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

route.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", (err, user) => {
      req.session.isLoggedIn = true;
      req.session.user = { name: user.name, id: user.id, email: user.email };
      next();
    })(req, res, next);
  },
  (req, res) => {
    res.redirect("/");
  }
);

route.get("/protected", (req, res) => {
  res.redirect("/");
});

module.exports = route;
