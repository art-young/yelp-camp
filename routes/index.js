var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

// Root route - landing page
router.get("/", function(req, res){
    res.render("landing");
});


// ====================
// AUTH ROUTES
// ====================

// Show register form
router.get("/register", function(req, res){
    // Send "register" in page variable so correct navbar li is active
    res.render("register", {page: "register"});
});

// Handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    eval(require('locus'));
    if (req.body.adminCode === process.env.ADMIN_CODE) {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if (err) {
            console.log(err);
            return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Successfully signed up. Welcome to YelpCamp " + user.username + "!");
            res.redirect("/campgrounds");
        });
    });
});

// Show login form
router.get("/login", function(req, res){
    // Send "login" in page variable so correct navbar li is active
    res.render("login", {page: "login"}); 
});

// Handle login logic using passport middleware
// router.post("/login", passport.authenticate("local", 
//     {
//         successRedirect: "/campgrounds",
//         failureRedirect: "/login",
//         failureFlash: true,
//         successFlash: "Welcome back to YelpCamp!"
//     }), function(req, res){
// });

// Handle login logic using custom handler so we can pull user.username for flash message
// http://www.passportjs.org/docs/authenticate/
router.post("/login", function(req, res, next) {
    passport.authenticate("local", function(err, user, info) {
        if (err) { 
            req.flash("error", err.message);
            return res.redirect("/login"); 
        }
        // User is set to false if auth fails.
        if (!user) { 
            req.flash("error", info.message); 
            return res.redirect("/login"); 
        }
        // Establish a session manually with req.logIn
        req.logIn(user, function(err) {
            if (err) { 
                req.flash("error", err.message);
                res.redirect("/login");
            }
            
            // Login success! Add custom success flash message.
            req.flash("success", "Welcome back " + user.username + "!");
            res.redirect("/campgrounds");
          
        });
    })(req, res, next);
});

// Logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out.");
    res.redirect("/campgrounds");
});


module.exports = router;