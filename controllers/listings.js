const Listing=require("../models/listing");

module.exports.index = async (req, res) => {
    const { category, search } = req.query;

    let filter = {};

    // Filter by category if provided and not 'All'
    if (category && category !== 'All') {
        filter.category = category;
    }

    // Filter by search if provided
    if (search) {
        const regex = new RegExp(escapeRegex(search), 'i'); // case-insensitive
        filter.title = regex;
    }

    const allListings = await Listing.find(filter);

    res.render("listings/index.ejs", { allListings, selectedCategory: category || 'All', searchTerm: search || '' });
};

// Helper function to escape special characters in the search string
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}                                                                                                                                                                       


module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListings = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "review", populate: { path: "author", }, }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    // let {title,description,image,price,location,country}=req.body;
    // let listing=req.body.listing;
    // console.log(listing);
    // if(!req.body.listing){
    //     throw new ExpressError(400,"send valid data for listing");
    // }
    // let result = listingSchema.validate(req.body);
    // console.log(result);
    // if (result.error) {
    //     throw new ExpressError(400, result.error);
    // }
    // console.log(req.body);
    let url=req.file.path;
    let filename=req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash("success", "New listing created");
    return res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing does not exist");
        res.redirect("/listings");
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    //if listing nhi h then error
    // if (!req.body.listing) {
    //     throw new ExpressError(400, "send valid data for listing");
    // }
    let { id } = req.params;
    let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image={url,filename};
    await listing.save();
    }
    req.flash("success", "listing updated");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing=async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted");
    res.redirect("/listings");
};
