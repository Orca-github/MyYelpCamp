const express = require('express');
const router = express.Router();
const { storeReturnTo,checkReturnTo } = require('../middleware');
const passport = require('passport')
const User = require('../models/user.js');
const catchAsycn = require('../utils/catchAsycn');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsycn(users.register))

router.route('/login')
    .get(users.renderLogin)
    .post(checkReturnTo,
        storeReturnTo,
        passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),
        users.login)

router.get('/logout',users.logout)

module.exports = router;
