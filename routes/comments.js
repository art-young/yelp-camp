var express = require("express");
var router = express.Router({mergeParams: true}); // this argument allows access to :id of campgrounds
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware"); //automatically requires content of index.js in middleware directory

// NEW route - show form to create new comment
router.get("/new", middleware.isLoggedIn, function(req, res){
    
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
router.post("/", middleware.isLoggedIn, function(req, res){
    
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
                  // add author username and id to comment and save comment
                  comment.author.id = req.user._id;
                  comment.author.username = req.user.username;
                  comment.save();
                  
                  // connect new comment to campground and save campground
                  campground.comments.push(comment);
                  campground.save();
                  
                  // redirect campground show page
                  res.redirect('/campgrounds/' + campground._id);
              }
           });
       }
    });
});

// EDIT comment route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    
    // Find the comment then render the edit comment page
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err) {
            console.log(err);
            res.redirect("back");
        } 
        else {
            // Pass the campground ID and comment object back to template
            // We always have access to req.params.id (campground id)
            // because of the app.use("/campgrounds/:id/comments", commentRoutes); line in app.js
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    });
    
});

// UPDATE comment route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    
    // Find and update the correct comment object
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
       if (err){
           res.redirect("back");
       } 
       else {
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});

// DESTROY Comment route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if (err){
            res.redirect("back");
        }
        else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;