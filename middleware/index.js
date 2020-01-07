// All of the middleware goes in this file

var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
    // Check if User is logged in
    if (req.isAuthenticated()){
        
        Campground.findById(req.params.id, function(err, foundCampground){
           if (err){
               res.redirect("back");
           } 
           else {
                // Does User own the campground?
                // Mongoose method to compare String id to Mongoose object id
                if (foundCampground.author.id.equals(req.user._id)){
                    // This is where the next part of the code runs
                    next();
                }
                else {
                    res.redirect("back");
                }
           }
        });
    }
    // Redirect to previous page
    else {
        res.redirect("back");
    }  
};

middlewareObj.checkCommentOwnership = function(req, res, next){
    // Check if User is logged in
    if (req.isAuthenticated()){
        
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if (err){
               res.redirect("back");
           } 
           else {
                // Does User own the comment?
                // Mongoose method to compare String id to Mongoose object id
                if (foundComment.author.id.equals(req.user._id)){
                    // This is where the next part of the code runs
                    next();
                }
                else {
                    res.redirect("back");
                }
           }
        });
    }
    // Redirect to previous page
    else {
        res.redirect("back");
    }  
};

middlewareObj.isLoggedIn = function(req, res, next){
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

module.exports = middlewareObj;