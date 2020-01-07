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
router.get("/:comment_id/edit", checkCommentOwnership, function(req, res){
    
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
router.put("/:comment_id", checkCommentOwnership, function(req, res){
    
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
router.delete("/:comment_id", checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if (err){
            res.redirect("back");
        }
        else {
            res.redirect("/campgrounds/" + req.params.id);
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

// Middleware to check ownership
function checkCommentOwnership(req, res, next){
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

module.exports = router;