const express = require('express');
const router = express.Router();
const Movie = require('../models/movieModel');
const User = require('../models/userModel');
const Purchase = require('../models/purchaseModel');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get personalized movie recommendations for a user
// @route   GET /api/movies/recommendations
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Get user's purchase history
    const purchases = await Purchase.find({ user: req.user._id });
    const purchasedMovieIds = purchases.map(purchase => purchase.movie);
    
    // Get user's favorite genres based on purchase history
    const purchasedMovies = await Movie.find({ _id: { $in: purchasedMovieIds } });
    
    // Count genre occurrences
    const genreCounts = {};
    purchasedMovies.forEach(movie => {
      movie.genre.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });
    
    // Sort genres by frequency
    const favoriteGenres = Object.keys(genreCounts).sort(
      (a, b) => genreCounts[b] - genreCounts[a]
    ).slice(0, 3); // Top 3 genres
    
    let recommendations;
    
    // If user has purchase history, recommend based on favorite genres
    if (favoriteGenres.length > 0) {
      recommendations = await Movie.find({
        _id: { $nin: purchasedMovieIds }, // Exclude already purchased movies
        genre: { $in: favoriteGenres }    // Include movies with favorite genres
      }).limit(5);
    } else {
      // If no purchase history, recommend top-rated movies
      recommendations = await Movie.find()
        .sort({ rating: -1 })
        .limit(5);
    }
    
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get similar movies to a specific movie
// @route   GET /api/movies/recommended/:id
// @access  Public
router.get('/recommended/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Film nije pronađen' });
    }
    
    // Find movies with similar genres
    const similarMovies = await Movie.find({
      _id: { $ne: req.params.id },         // Exclude the current movie
      genre: { $in: movie.genre }          // Include movies with similar genres
    })
    .sort({ rating: -1 })                  // Sort by rating
    .limit(5);                             // Limit to 5 recommendations
    
    res.json(similarMovies);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get trending movies (most purchased in last 30 days)
// @route   GET /api/movies/trending
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    // Get purchases from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPurchases = await Purchase.find({
      purchaseDate: { $gte: thirtyDaysAgo }
    });
    
    // Count movie occurrences
    const movieCounts = {};
    recentPurchases.forEach(purchase => {
      const movieId = purchase.movie.toString();
      movieCounts[movieId] = (movieCounts[movieId] || 0) + 1;
    });
    
    // Sort movies by purchase count
    const trendingMovieIds = Object.keys(movieCounts)
      .sort((a, b) => movieCounts[b] - movieCounts[a])
      .slice(0, 5); // Top 5 trending
    
    // Get movie details
    const trendingMovies = await Movie.find({
      _id: { $in: trendingMovieIds }
    });
    
    // Sort by the original trending order
    const sortedTrendingMovies = trendingMovieIds
      .map(id => trendingMovies.find(movie => movie._id.toString() === id))
      .filter(Boolean);
    
    res.json(sortedTrendingMovies);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
