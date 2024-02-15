const express = require('express');
const router = express.Router({mergeParams:true});
const catchAsycn = require('../utils/catchAsycn');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campGround');
const {reviewSchema} = require('../schemas.js');
const Review = require('../models/review.js');
const {validateReview,isLoggedIn,isReviewAuthor}= require('../middleware')
const reviews = require('../controllers/reviews');


router.post('/',isLoggedIn,validateReview,catchAsycn (reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsycn(reviews.deleteReview))

module.exports = router;