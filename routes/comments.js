var express = require("express");
var router = express.Router({mergeParams: true}); // this argument allows access to :id of campgrounds
var Campground = require("../models/campground");
var Comment = require("../models/comment");


// NEW route - show form to create new comment
router.get("/new", isLoggedIn, function(req, res){
    
    // Find the campground then render the new comment form for that campground
    Campground.findById(req.params.id, function(err, campground){
       if(err) {
           console.log(err);
       } 
       else {
           res.render("comments/new", {campground: campground});
       }
    });
    
});


// CREATE route - add new comment to campground
router.post("/", isLoggedIn, function(req, res){
    
    // lookup campground using id
    Campground.findById(req.params.id, function(err, campground){
       if(err) {
           console.log(err);
           res.redirect("/campgrounds");
       } 
       else {
           // create new comment
           Comment.create(req.body.comment, function(err, comment){
              if(err) {
                  console.log(err);
              } 
              else {
                  // connect new comment to campground
                  campground.comments.push(comment);
                  campground.save();
                  
                  // redirect campground show page
                  res.redirect('/campgrounds/' + campground._id);
              }
           });
       }
    });
});

// Middleware checking if user is logged in
function isLoggedIn(req, res, next){
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

module.exports = router;