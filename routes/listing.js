const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({storage});

if(process.env.NODE_ENV !== "production"){
    require('dotenv').config(); 
}
if (!process.env.MAPBOX_TOKEN) {
  throw new Error("MAPBOX_TOKEN is missing from environment variables");
}

console.log("MAPBOX_TOKEN:", process.env.MAPBOX_TOKEN);


const validateListing = (req,res,next) =>{
    console.log("Validating listing. Incoming req.body:", req.body);
    let {error}= listingSchema.validate(req.body);
    if(error){
        let errMsg =error.details.map((el) =>el.message).join(",");

        throw new ExpressError(400,errMsg);
    } else {
    next();
}
};

//Category Route
router.get("/search", wrapAsync(listingController.index));
router.get("/category/:category", wrapAsync(listingController.index));

//New Route
router.get("/new",isLoggedIn, listingController.renderNewForm);

router
.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn, upload.single('image'),validateListing, wrapAsync(listingController.createListing));



router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put( isLoggedIn, isOwner, upload.single('image'), validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));












//Edit Route
router.get("/:id/edit",isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));



module.exports = router;
