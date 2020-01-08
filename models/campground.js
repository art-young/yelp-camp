var mongoose    = require("mongoose");

var campgroundSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Comment"
        }
    ]
});

// Add pre-hook to Campground model so Comments are also  
// deleted when a corresponding Campground is destroyed
// This is invoked by the .remove() method, not findByIdAndRemove()!
var Comment = require("./comment");
campgroundSchema.pre("remove", async function() {
    await Comment.deleteMany({
        _id: {
            $in: this.comments
        }
    }) ;
});

module.exports = mongoose.model("Campground", campgroundSchema);