// All of the middleware goes in this file

var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
    // Check if User is logged in
    if (req.isAuthenticated()){
        
        Campground.findById(req.params.id, function(err, foundCampground){
            // Flash error message if there is an error or if foundCampground is null
            if (err || !foundCampground){
                req.flash("error", "Campground not found.");
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
                    // Add flash message if current user is not the author of the campground
                    req.flash("error", "You don't have permission to do that.");
                    res.redirect("back");
                }
            }
        });
    }
    // Redirect to previous page if not authenticated
    else {
        req.flash("error", "You must be logged in to do that.");
        res.redirect("back");
    }  
};

middlewareObj.checkCommentOwnership = function(req, res, next){
    // Check if User is logged in
    if (req.isAuthenticated()){
        
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if (err || !foundComment){
               req.flash("error", "Comment not found.");
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
                    // Add flash message if current user is not the author of the comment
                    req.flash("error", "You don't have permission to do that.");
                    res.redirect("back");
                }
           }
        });
    }
    // Redirect to previous page
    else {
        req.flash("error", "You must be logged in to do that.");
        res.redirect("back");
    }  
};

middlewareObj.isLoggedIn = function(req, res, next){
    if (req.isAuthenticated()) {
        return next();
    }
    // Add flash message if user is not authenticated
    req.flash("error", "You must be logged in to do that.");
    res.redirect("/login");
};

module.exports = middlewareObj;