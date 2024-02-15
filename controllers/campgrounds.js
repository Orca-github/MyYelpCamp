const Campground = require('../models/campGround');
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.Mapbox_token;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index =  async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds})
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req,res)=>{
    // if(!req.body.campground) throw new ExpressError('Invalid camground Data',400);
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const camp = new Campground(req.body.campground);
    camp.geometry = geoData.body.features[0].geometry;
    camp.image = req.files.map(f => ({ url: f.path, filename: f.filename }));
    camp.author = req.user._id;
    await camp.save();
    console.log('create campground log:',camp)
    req.flash('success','successfully mde a new campground');

    res.redirect(`/campgrounds/${camp._id}`);
    
}

module.exports.showCampground = async (req,res)=>{
    const campground = await Campground.findById(req.params.id).populate(
        {path:'reviews',
        populate:{
            path:'author'
        }}
        ).populate('author');
    //console.log(campground);
    if(!campground){
        req.flash('error','Cannot find that campground');
        return res.redirect('/campgrounds');

    }
    res.render('campgrounds/show',{campground});
}

module.exports.renderEditionForm = async (req,res)=>{
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error','Cannot find that campground');
        return res.redirect('/campgrounds');

    }
    res.render('campgrounds/edit',{campground});
}

module.exports.updateCampground = async (req,res)=>{
    const {id} =req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.image.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
           await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({$pull:{image:{filename:{$in:req.body.deleteImages}}}})
        console.log("deleted iamge file name",campground)
    }
    req.flash('success','Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async(req,res)=> {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully delete campground');
    res.redirect('/campgrounds')
}