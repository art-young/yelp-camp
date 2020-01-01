var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    seedDB      = require("./seeds");

// Fix mongoose Deprecation Warnings: https://mongoosejs.com/docs/deprecations.html
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// Connect to yelp_camp mongo db
mongoose.connect("mongodb://localhost:27017/yelp_camp");

// Need this line to properly use body-parser
app.use(bodyParser.urlencoded({extended: true}));

// Set view engine to ejs so we don't have to include .ejs extension when using response.render
app.set("view engine", "ejs");

// Serve the public directory
app.use(express.static(__dirname + "/public"));

// Seed Database with sample campgrounds and comments
seedDB();


// SCHEMA SETUP


//CREATE A CAMPGROUND!
// Campground.create(
//     {
//         name: "Granite Hill", 
//         image: "https://cdn.pixabay.com/photo/2016/11/21/14/31/vw-bus-1845719_960_720.jpg",
//         description: "This is a huge granite hill, no bathrooms. No water. Beautiful granite!"
        
//     }, function(err, campground){
//         if (err){
//             console.log(err);
//         } 
//         else {
//             console.log("NEWLY CREATED CAMPGROUND: ");
//             console.log(campground);
//         }
//     }
// );

// HARD CODED ARRAY, used before MongoDB 
// var campgrounds = [
//     {name: "Salmon Creek", image: "https://farm2.staticflickr.com/1086/882244782_d067df2717.jpg"},
//     {name: "Granite Hill", image: "https://cdn.pixabay.com/photo/2016/11/21/14/31/vw-bus-1845719_960_720.jpg"},
//     {name: "Mountain Goat's Rest", image: "https://farm2.staticflickr.com/1363/1342367857_2fd12531e7.jpg"},
//     {name: "Salmon Creek", image: "https://farm2.staticflickr.com/1086/882244782_d067df2717.jpg"},
//     {name: "Granite Hill", image: "https://cdn.pixabay.com/photo/2016/11/21/14/31/vw-bus-1845719_960_720.jpg"},
//     {name: "Mountain Goat's Rest", image: "https://farm2.staticflickr.com/1363/1342367857_2fd12531e7.jpg"},
//     {name: "Salmon Creek", image: "https://farm2.staticflickr.com/1086/882244782_d067df2717.jpg"},
//     {name: "Granite Hill", image: "https://cdn.pixabay.com/photo/2016/11/21/14/31/vw-bus-1845719_960_720.jpg"},
//     {name: "Mountain Goat's Rest", image: "https://farm2.staticflickr.com/1363/1342367857_2fd12531e7.jpg"}
// ];

// Root route - landing page
app.get("/", function(req, res){
    res.render("landing");
});

// INDEX route - shows all campgrounds
app.get("/campgrounds", function(req, res){
     
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

//CREATE route - add new campground to DB
app.post("/campgrounds", function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newCampground = {name: name, image: image, description: desc};
    
    // Old line, array push before using database
    //campgrounds.push(newCampground);
    
    // Create a new campground and save to 
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
app.get("/campgrounds/new", function(req, res){
    res.render("campgrounds/new"); 
});


// SHOW route - show details of a campground with given id
app.get("/campgrounds/:id", function(req, res){
    
    // Find the campground with provided ID
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

// ====================
// COMMENTS ROUTES
// ====================


// NEW route - show form to create new comment
app.get("/campgrounds/:id/comments/new", function(req, res){
    
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


//CREATE route - add new comment to campground
app.post("/campgrounds/:id/comments", function(req, res){
    
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


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp server started...");
});