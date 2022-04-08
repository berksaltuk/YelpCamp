const Campground = require('../models/campground')
const Review = require('../models/review')

module.exports.createReview = async (req, res) =>{

    const {review} = req.body
    const {id} = req.params
    const camp = await Campground.findById(id);
    const newReview = new Review(review);
    newReview.author = req.user._id;
    camp.reviews.push(newReview);
    await newReview.save();
    await camp.save();
    req.flash('success', 'Successfully added a review!');
    res.redirect(`/campgrounds/${camp._id}`)
}

module.exports.deleteReview = async (req, res)=>{
    
    await Campground.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.reviewId}})
    await Review.findByIdAndDelete(req.params.reviewId)
    req.flash('success', 'Successfully deleted the review!');
    res.redirect(`/campgrounds/${req.params.id}`)
}