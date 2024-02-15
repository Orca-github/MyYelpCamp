const express = require('express');
const router = express.Router();
const catchAsycn = require('../utils/catchAsycn');
const Campground = require('../models/campGround');
const {isLoggedIn,validateCampground,isAuthor} = require('../middleware')
const campgrounds = require('../controllers/campgrounds')
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsycn(campgrounds.index))
    
    .post( isLoggedIn,upload.array('image'),validateCampground,catchAsycn(campgrounds.createCampground))

router.get('/new',isLoggedIn,campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsycn(campgrounds.showCampground))
    .put(isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchAsycn(campgrounds.updateCampground))
    .delete(isLoggedIn,isAuthor, catchAsycn(campgrounds.deleteCampground))


router.get('/:id/edit',isLoggedIn,isAuthor, catchAsycn(campgrounds.renderEditionForm));


module.exports = router;

