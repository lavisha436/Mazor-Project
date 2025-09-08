const mongoose=require("mongoose");
const Schema= mongoose.Schema;
const Review=require("./reviews.js");

const listingSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{
        url:String,
        filename:String,
    },
    price:Number,
    location:String,
    country:String,
    review:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        },
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    category: {
        type: String,
        enum: ['Trending', 'Rooms', 'Iconic_Cities', 'Mountains', 'Castles', 'Amazing_Pools', 'camping', 'Farms', 'Arctic'], // Example values
        required: true,
    },
});

listingSchema.post("findOneAndDelete",async (listing)=>{
    if(listing){
        await Review.deleteMany({ _id: { $in: listing.review } });
    } 
});

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;