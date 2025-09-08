const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsyncs.js");
const ExpressError = require("../utils/ExpressError.js");
// const { listingSchema, reviewSchema } = require("../schema.js");
const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");
const { validateReview,isLoggedIn,isReviewAuthor }=require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

// const validateReview = (req, res, next) => {
//     let { error } = reviewSchema.validate(req.body);
//     if (error) {
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     } else {
//         next();
//     }
// };


//review route
//create
router.post("/",isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//delete
router.delete("/:reviewId",isReviewAuthor, isLoggedIn, wrapAsync(reviewController.deleteReview));

module.exports=router;