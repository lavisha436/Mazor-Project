if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}

// console.log(process.env.SECRET);

const express=require("express");
const app=express();
const mongoose=require("mongoose");
// const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
// const wrapAsync=require("./utils/wrapAsyncs.js");
const ExpressError=require("./utils/ExpressError.js");
// const {listingSchema,reviewSchema} = require("./schema.js");
// const Review=require("./models/reviews.js");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter = require("./routes/user.js");


// const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust"
// ;
const dbURL = process.env.ATLASDB_URL;

main().then(()=>{
    console.log("connected to db");
}).catch(err=>{
    console.log(err);
});
async function main(){
    await mongoose.connect(dbURL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

//mongo session store
const store = MongoStore.create({
    mongoUrl: dbURL,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600,
});
store.on("error",()=>{
    console.log("ERROR IN MONGO SESSION STORE",err);
});
//sessions
const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
    },
};

// app.get("/", (req, res) => {
//     res.send("working");
// });


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser=req.user;
    next();
});

app.use((req, res, next) => {
    res.locals.selectedCategory = req.query.category || 'All';
    res.locals.searchTerm = req.query.search || '';
    next();
});


// //demo user
// app.get("/demouser", async (req,res)=>{
//     let fakeUser=new User({
//         email:"abc@gmail.com",
//         username:"abc"
//     });
//     let registeredUser=await User.register(fakeUser,"hello");
//     res.send(registeredUser);
// })



// app.get("/testListing",(req,res)=>{
//     let sampleListing = new Listing({
//         title:"My New Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Goa",
//         country:"India",
//     });
//     // sampleListing.save();
//     console.log("saved");
//     res.send("successful");
// });

//schema validations middleware
//for listing
// const validateListing=(req,res,next)=>{
//     let {error} = listingSchema.validate(req.body);
//     if (error) {
//         let errMsg=error.details.map((el)=>el.message).join(",");
//         throw new ExpressError(400,errMsg);
//     }else{
//         next();
//     }
// };
//for review
// const validateReview = (req, res, next) => {
//     let { error } = reviewSchema.validate(req.body);
//     if (error) {
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     } else {
//         next();
//     }
// };

// //index route
// app.get("/listings", wrapAsync(async (req,res)=>{
//     const allListings= await Listing.find({});
//     res.render("listings/index.ejs",{allListings});

// }));

// //new route
// app.get("/listings/new",(req,res)=>{
//     res.render("listings/new.ejs");
// });

// //show route
// app.get("/listings/:id",wrapAsync(async (req,res)=>{
//     let {id}  = req.params;
//    const listing = await Listing.findById(id).populate("review");
//    res.render("listings/show.ejs",{listing});
// }));

// //to create
// app.post("/listings",validateListing,wrapAsync(async (req,res,next)=>{
//     // let {title,description,image,price,location,country}=req.body;
//     // let listing=req.body.listing;
//     // console.log(listing);
//         // if(!req.body.listing){
//         //     throw new ExpressError(400,"send valid data for listing");
//         // }
//         let result=listingSchema.validate(req.body);
//         console.log(result);
//         if(result.error){
//             throw new ExpressError(400,result.error);
//         }
//         const newListing = new Listing(req.body.listing);
//         await newListing.save();
//         res.redirect("/listings");
// }));

// //to edit
// app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
//     let {id}  = req.params;
//    const listing = await Listing.findById(id);
//    res.render("listings/edit.ejs",{listing});
// }));

// //to update
// app.put("/listings/:id",validateListing,wrapAsync(async (req,res)=>{
//     //if listing nhi h then error
//     // if (!req.body.listing) {
//     //     throw new ExpressError(400, "send valid data for listing");
//     // }
//     let {id}  = req.params;
//     await Listing.findByIdAndUpdate(id,{...req.body.listing});
//     res.redirect(`/listings/${id}`);
// }));

// //to delete
// app.delete("/listings/:id",wrapAsync(async (req,res)=>{
//     let {id}  = req.params;
//     let deletedListing = await Listing.findByIdAndDelete(id);
//     res.redirect("/listings");
// }));

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

//review route
// app.post("/listings/:id/reviews", validateReview,wrapAsync(async(req,res)=>{
//    let listing=await Listing.findById(req.params.id);
//    let newReview=new Review(req.body.review);
//    listing.review.push(newReview);
//    await newReview.save();
//    await listing.save();
//    res.redirect( `/listings/${listing._id}`);
// }));
// app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
//     let {id,reviewId}=req.params;
//     await Listing.findByIdAndUpdate(id,{$pull:{review:reviewId}});//pull operator
//     await Review.findByIdAndDelete(reviewId);//review delete
//     res.redirect(`/listings/${id}`);
// }));

//error handling middleware
app.use((req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});

app.use((err,req,res,next)=>{
    let {status=500,message="something went wrong"}=err;
    res.status(status).render("error.ejs", {err});
    // res.status(status).send(message);
});

app.listen("8080",()=>{
    console.log("server is listening to port 8080");
});