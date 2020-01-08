var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    methodOverride  = require("method-override"),
    Campground      = require("./models/campground"),
    Comment         = require("./models/comment"),
    User            = require("./models/user"),
    seedDB          = require("./seeds");
    
// Require routes    
var commentRoutes       = require("./routes/comments"),
    campgroundRoutes    = require("./routes/campgrounds"),
    indexRoutes         = require("./routes/index");

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

// Use method override
app.use(methodOverride("_method"));

// Use connect-flash for flash messages
app.use(flash());

// Seed Database with sample campgrounds and comments
// seedDB();


// PASSPORT CONFIG
app.use(require("express-session")({
    secret: "This could be anything we want!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to pass logged in user and flash messages to every template
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// ROUTES
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp server started...");
});