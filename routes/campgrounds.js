var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");


// INDEX route - shows all campgrounds
router.get("/", function(req, res){
     
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
      if (err){
          console.log(err);
      } 
      else {
          res.render("campgrounds/index", {campgrounds:allCampgrounds});
      }
    });
    
});

// CREATE route - add new campground to DB
router.post("/", isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {name: name, image: image, description: desc, author:author};
    
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if (err){
            console.log(err);
        }
        else {
            // redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
    
});


// NEW route - show form to create new campground
router.get("/new", isLoggedIn, function(req, res){
    res.render("campgrounds/new"); 
});


// SHOW route - show details of a campground with given id
router.get("/:id", function(req, res){
    
    // Find the campground with provided ID
    // In the database, Comments are stored in Campground objects as reference ID's
    // Use mongoose populate() method before executing callback function to get 
    // the actual comment objects from the Comments collection
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
       if (err){
           console.log(err);
       } 
       else {
            // Render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground}); 
       }
    });
    
});

// EDIT route - edit campground
router.get("/:id/edit", function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
       if (err){
           res.redirect("/campgrounds");
       } 
       else {
           res.render("campgrounds/edit", {campground: foundCampground});
       }
    });
});

// UPDATE campground route
router.put("/:id", function(req, res){
    // Find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if (err){
           res.redirect("/campgrounds");
       } 
       else {
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});

// DESTROY campground route
router.delete("/:id", function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if (err){
            res.redirect("/campgrounds");
        }
        else {
            res.redirect("/campgrounds");
        }
    })
});

// Middleware checking if user is logged in
function isLoggedIn(req, res, next){
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

module.exports = router;