const Campground = require('../models/campground')
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")

const mapBoxToken = process.env.MAPBOX_TOKEN;

const geocoder = mbxGeocoding({accessToken: mapBoxToken})

const {cloudinary} = require("../cloudinary")

module.exports.index = async (req, res) => {
    const camps = await Campground.find({})
    res.render('campgrounds/index', {camps})
}

module.exports.renderNewForm = (req, res) => {
    
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()


    const newCamp = Campground(req.body.campground);
    newCamp.geometry = geoData.body.features[0].geometry;
    newCamp.images = req.files.map(f => ({url:f.path, filename: f.filename}))
    newCamp.author = req.user._id;
    await newCamp.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${newCamp._id}`)
}

module.exports.showCampground = async (req, res) => {
    const {id} = req.params;
    const c = await Campground.findById(id).populate({
        path:'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if( !c){
        req.flash('error', 'Campground not found!')
        return res.redirect('/')
    }
    res.render('campgrounds/show', {c})
}

module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params
    const c = await Campground.findById(id);
    if( !c){
        req.flash('error', 'Campground not found!')
        return res.redirect('/')
    }
    res.render('campgrounds/edit', {c});
}

module.exports.editCampground = async (req, res) => {
    const {id} = req.params
    
    c = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs = req.files.map(f => ({url:f.path, filename: f.filename}))
    c.images.push(...imgs);
    await c.save()

    if(req.body.deleteImages) 
    {
        for( let filename of req.body.deleteImages)
        {
            await cloudinary.uploader.destroy(filename);
        }
        await c.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages}}}})
    }
    req.flash('success', 'Successfully updated the campground!');
    res.redirect(`/campgrounds/${c._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const {id} = req.params
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the campground!');
    res.redirect("/campgrounds")
}