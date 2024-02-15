
const { default: mongoose } = require('mongoose');
const Campground = require('../models/campGround')
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers');


mongoose.connect('mongodb://localhost:27017/yelp-camp',{});

const db = mongoose.connection;
db.on('error',console.error.bind(console,"connection error:"));
db.once('open',()=>{
    console.log("Database connected");
});

const sample =array=>array[Math.floor(Math.random() * array.length)];

const seedDb = async ()=>{
    await Campground.deleteMany({});
   for(let i =0; i <50;i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20) + 10;
        const camp = new Campground({
            author:'65b056f63a54cb2a8ded0969',
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis quo praesentium porro ratione excepturi officia vitae assumenda at minima voluptates suscipit, ea, rem deleniti! Deserunt soluta aspernatur dolore quisquam necessitatibus?',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]            },
            image: [
                {
                    url: 'https://res.cloudinary.com/dbkmixaei/image/upload/v1707345150/YelpCamp/kxpnkxgue62nnsotfgyz.jpg',
                    filename: 'YelpCamp/kxpnkxgue62nnsotfgyz'
                },
                {
                    url: 'https://res.cloudinary.com/dbkmixaei/image/upload/v1707345150/YelpCamp/a2adobsrkxrctdil8oyx.jpg',
                    filename: 'YelpCamp/a2adobsrkxrctdil8oyx'
                }
            ]
        })
        await camp.save();
   }
}

seedDb().then( ()=>{
    mongoose.connection.close()
});