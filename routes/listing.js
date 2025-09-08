const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsyncs.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");

const listingController=require("../controllers/listings.js");
const multer=require("multer");
const {storage}=require("../cloudConfig.js");
const upload=multer({storage});

//for index and create
router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn, validateListing, upload.single("listing[image]"), wrapAsync(listingController.createListing)
);

//new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//for show,update and delete
router.route("/:id")
.get(wrapAsync(listingController.showListings))
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));


// //index route
// router.get("/", wrapAsync(listingController.index));

// //new route
// router.get("/new",isLoggedIn, listingController.renderNewForm );

// //show route
// router.get("/:id", wrapAsync(listingController.showListings));

// //to create
// router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing));

//to edit
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));

//to update
// router.put("/:id", isLoggedIn,isOwner, validateListing, wrapAsync(listingController.updateListing));

//to delete
// router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

module.exports=router;
