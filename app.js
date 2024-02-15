if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path')
const methodOverride = require('method-override')
const { default: mongoose } = require('mongoose');
// const Campground = require('./models/campGround');
const ejsMate = require('ejs-mate');
const session = require('express-session');
// const AppError = require('./AppError')
const catchAsycn = require('./utils/catchAsycn');
const ExpressError = require('./utils/ExpressError')
const Joi = require('joi');
const { captureRejectionSymbol } = require('events');
const {campgroundSchema,reviewSchema} = require('./schemas.js');
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const campgroundsRoutes = require('./routes/campgrounds.js');
const reviewsRoutes = require('./routes/review.js');
const usersRoutes = require('./routes/user');

const MongoStore = require('connect-mongo');

//const dbUrl = process.env.DB_URL
const dbUrl  = 'mongodb://localhost:27017/yelp-camp'
//mongoose.connect('mongodb://localhost:27017/yelp-camp',{});

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
    // useFindAndModify: false
});

const db = mongoose.connection;
db.on('error',console.error.bind(console,"connection error:"));
db.once('open',()=>{
    console.log("Database connected");
});


app.listen(3000,()=>{
    console.log('Servering on port 3000')
})

app.engine('ejs',ejsMate);
app.set('view engine','ejs' );
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(mongoSanitize())
app.use(helmet())

const store = MongoStore.create({
    mongoUrl:dbUrl,
touchAfter: 24 * 60 * 60,//秒
crypto: {
    secret:'this',
}
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name:'notdefult',
    secret:'this',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        // secure:true,
        //一周的毫秒
        expires: Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
};


app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",//新版本的boostrap的网址
    "https://res.cloudinary.com/dbkmixaei/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dbkmixaei/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser',async(req,res)=>{
    const user = new User({email:'cottttt@gamil.com',username:'colt'});
    const newUser = await User.register(user,'chicken');
    res.send(newUser);
})

const verifyPassword = (req,res,next)=>{
    const {password} = req.query;
    if(password==='chickennugget'){
        next();
    }
    // throw new AppError('password required',401);
}

app.get('/',(req,res)=>{

    res.render('home')
})

app.use('/',usersRoutes);
app.use('/campgrounds',campgroundsRoutes);
app.use('/campgrounds/:id/reviews',reviewsRoutes);


app.use(express.static(path.join(__dirname,'public')))



app.get('/error',(req,res)=>{
     chicken.fly()
})

app.get('/secret', verifyPassword, (req, res) => {
    res.send('MY SECRET IS: Sometimes I wear headphones in public so I dont have to talk to anyone')
})

// app.get('/makecampGround',catchAsycn(async (req,res)=>{
//     const camp = new Campground({title:'My Backyard',description:'chaep camp!'});
//     await camp.save();
//     res.send(camp);
// }));

app.all('*',(req,res,next)=>{
    next(new ExpressError('Page No Found',404))
})

app.use((err,req,res,next)=>{
    const{statusCode = 500} = err;
    if(!err.message) err.message = ' Something Went wrong bro';
    res.status(statusCode).render('error',{err});
})

