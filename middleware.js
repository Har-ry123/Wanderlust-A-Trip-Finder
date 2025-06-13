const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.isOwner = async(req,res,next) => {
    console.log("Executing isOwner middleware");
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    if(!listing.owner.equals(req.user._id)){
        req.flash("error", "You don't have permission to edit!");
        return res.redirect("back");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.validateReview = (req,res,next) => {
    const { reviewSchema } = require("./schema.js"); // Import reviewSchema here
    let { error } = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        req.flash("error", errMsg);
        throw new ExpressError(400,errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async(req,res,next) => {
    console.log("Executing isReviewAuthor middleware");
    let { reviewId } = req.params;
    let review = await Review.findById(reviewId).populate("author");
    if (!review) {
        req.flash("error", "Review you requested for does not exist!");
        return res.redirect("/listings");
    }
    if(!review.author.equals(req.user._id)){
        req.flash("error", "You don't have permission to delete this review!");
        return res.redirect("back");
    }
    next();
};