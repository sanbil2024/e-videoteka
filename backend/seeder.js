const mongoose = require('mongoose');
const Movie = require('./models/movieModel');
const User = require('./models/userModel');
const Order = require('./models/orderModel');
const connectDB = require('./config/db');
const movies = require('./data/movies.json');
const bcrypt = require('bcryptjs');

// Connect to database
connectDB();

// Import data
const importData = async () => {
  try {
    // Clear existing data
    await Movie.deleteMany();
    await User.deleteMany();
    await Order.deleteMany();

    // Create admin user
    const adminUser = await User.create({
      name: 'Korisnik 1',
      email: 'a@a.com',
      password: '123',
      isAdmin: true,
    });

    // Create regular user
    await User.create({
      name: 'Korisnik 2',
      email: 'b@b.com',
      password: '123',
    });

    // Add user ID to movies
    const sampleMovies = movies.map(movie => {
      return { ...movie, user: adminUser._id };
    });

    // Insert movies
    await Movie.insertMany(sampleMovies);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Destroy data
const destroyData = async () => {
  try {
    // Clear existing data
    await Movie.deleteMany();
    await User.deleteMany();
    await Order.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
