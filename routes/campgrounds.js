var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware"); //automatically requires content of index.js in middleware directory

// Geocoder setup to make Google Maps API work
var NodeGeocoder = require('node-geocoder');
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
var geocoder = NodeGeocoder(options);

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

//CREATE route - add new campground to DB
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
    
    // Get coordinates and address from location string
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            console.log(err.message);
            req.flash("error", "Invalid address");
            return res.redirect("back");
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newCampground = {name: name, price: price, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
        // Create a new campground and save to DB
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                console.log(err);
            } 
            else {
                //redirect back to campgrounds page
                console.log(newlyCreated);
                res.redirect("/campgrounds");
            }
        });
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

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    
    // We're geocoding every time an update happens, even if the location hasn't changed.
    // This could possibly be optimized by comparing the new location to current location
    // in the database but may be slower than just geocoding every time.
    geocoder.geocode(req.body.campground.location, function (err, data) {
        if (err || !data.length) {
            console.log(err.message);
            req.flash("error", "Invalid address");
            return res.redirect("back");
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;
        
        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
            if(err){
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                req.flash("success","Successfully Updated!");
                res.redirect("/campgrounds/" + campground._id);
            }
        });
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