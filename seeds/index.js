const mongoose = require('mongoose')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground')

mongoose.connect('mongodb://localhost:27017/yelp-camp', 
{ useNewUrlParser: true, 
  useUnifiedTopology: true 
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected.");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () =>{
    await Campground.deleteMany({});
    for ( let i = 0; i < 200; i++)
    {
        const random1000 = Math.floor(Math.random() * 1000)
        const camp = new Campground( {
            author: '623abc27a55627076baa90a1',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Cool camping place to spend your holiday!",
            price: Math.floor(Math.random() * 1000 + 100),
            
            geometry: { 
                    type : "Point", 
                    coordinates : [
                        cities[random1000].longitude,
                        cities[random1000].latitude
                    ]
                },

            images: [
                { 
                    url: 'https://res.cloudinary.com/dcm3kpuys/image/upload/v1648187443/YelpCamp/lywnhodxa90fgt4pp0mm.jpg', 
                    filename : 'YelpCamp/alywnhodxa90fgt4pp0mm' 
                }
            ]
        })
        await camp.save();
        console.log(camp);
    }
}

seedDB().then( () => {
    mongoose.connection.close();
});