// (1) import package yang diperlukan
const router = require("express").Router();
const multer = require("multer");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
// (2) import auth/controller.js
const controller = require("./controller"); // (3) buat endpoint untuk register user baru
passport.use(
  new LocalStrategy({ usernameField: "email" }, controller.localStrategy)
);
router.post("/register", multer().none(), controller.register);
router.post("/login", multer().none(), controller.login);
router.post("/logout", controller.logout);
router.get("/me", controller.me);

// (4) export router
module.exports = router;
