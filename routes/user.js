const express = require("express");
const router=express.Router();
const User=require("../models/user.js");
const wrapAsync = require("../utils/wrapAsyncs.js");
const passport = require("passport");
const {isLoggedIn,saveRedirectUrl}=require("../middleware.js");

const userController=require("../controllers/users.js");

router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signUp));

// router.get("/signup",userController.renderSignupForm);
// router.post("/signup",wrapAsync(userController.signUp));
router.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), userController.logIn);

// router.get("/login", userController.renderLoginForm);
// router.post("/login",saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), userController.logIn);

router.get("/logout",userController.logOut);

module.exports=router;