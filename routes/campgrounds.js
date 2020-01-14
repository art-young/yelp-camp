var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware"); //automatically requires content of index.js in middleware directory


// INDEX route - shows all campgrounds
router.get("/", function(req, res){
     
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
      if (err){
          console.log(err);
      } 
      else {
          res.render("campgrounds/index", {campgrounds:allCampgrounds, page: "campgrounds"});
      }
    });
    
});

// CREATE route - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {name: name, price: price, image: image, description: desc, author:author};
    
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
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new"); 
});


// SHOW route - show details of a campground with given id
router.get("/:id", function(req, res){
    
    // Find the campground with provided ID
    // In the database, Comments are stored in Campground objects as reference ID's
    // Use mongoose populate() method before executing callback function to get 
    // the actual comment objects from the Comments collection
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if (err || !foundCampground){
            req.flash("error", "Campground not found.")
            res.redirect("back");
        } 
        else {
            // Render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground}); 
        }
    });
    
});

// EDIT route - edit campground
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    
    // Find given campground and render edit page
    Campground.findById(req.params.id, function(err, foundCampground){
        if (err){
            req.flash("error", "Campground not found.");
            res.redirect("back");
        }
        else {
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
    
});

// UPDATE campground route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
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
// Here we use findById and later deleteOne() instead of findByIdAndRemove() because
// the pre-hook in campground.js to delete any associated comments is invoked on
// deleteOne().
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if (err){
            req.flash("error", "Campground delete failed.");
            res.redirect("/campgrounds");
        }
        else {
            foundCampground.remove();
            req.flash("success", "Campground deleted.");
            res.redirect("/campgrounds");
        }
    })
});

module.exports = router;