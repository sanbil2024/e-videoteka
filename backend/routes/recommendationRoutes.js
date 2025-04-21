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
    
    // If user has no purchases, return top-rated movies
    if (purchasedMovieIds.length === 0) {
      const topRatedMovies = await Movie.find()
        .sort({ rating: -1 })
        .limit(5);
      return res.json(topRatedMovies);
    }
    
    // Get user's favorite genres based on purchase history
    const purchasedMovies = await Movie.find({ _id: { $in: purchasedMovieIds } });
    
    // Count genre occurrences
    const genreCounts = {};
    purchasedMovies.forEach(movie => {
      if (movie && movie.genre) {
        movie.genre.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });
    
    // Sort genres by frequency
    const favoriteGenres = Object.keys(genreCounts).sort(
      (a, b) => genreCounts[b] - genreCounts[a]
    );
    
    // Always use available genres, even if there's just one from a single purchase
    if (favoriteGenres.length > 0) {
      // Limit to top 3 genres if available
      const topGenres = favoriteGenres.slice(0, Math.min(3, favoriteGenres.length));
      
      // Find recommendations based on favorite genres
      const recommendations = await Movie.find({
        _id: { $nin: purchasedMovieIds }, // Exclude already purchased movies
        genre: { $in: topGenres }         // Include movies with favorite genres
      })
      .sort({ rating: -1 })
      .limit(5);
      
      // If we found enough recommendations, return them
      if (recommendations.length >= 3) {
        return res.json(recommendations);
      }
      
      // If not enough recommendations, get additional top-rated movies
      const existingIds = recommendations.map(movie => movie._id);
      const additionalMovies = await Movie.find({
        _id: { 
          $nin: [...purchasedMovieIds, ...existingIds] 
        }
      })
      .sort({ rating: -1 })
      .limit(5 - recommendations.length);
      
      return res.json([...recommendations, ...additionalMovies]);
    } else {
      // Fallback to top-rated movies (should not happen if user has purchases)
      const topRatedMovies = await Movie.find({
        _id: { $nin: purchasedMovieIds }
      })
      .sort({ rating: -1 })
      .limit(5);
      
      return res.json(topRatedMovies);
    }
  } catch (error) {
    console.error('Error in personalized recommendations:', error);
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
    
    // Get all movies except the current one
    const allMovies = await Movie.find({
      _id: { $ne: req.params.id }
    });
    
    // Calculate similarity score for each movie
    const moviesWithScores = allMovies.map(otherMovie => {
      // Count how many genres match
      let matchingGenres = 0;
      if (movie.genre && otherMovie.genre) {
        movie.genre.forEach(genre => {
          if (otherMovie.genre.includes(genre)) {
            matchingGenres++;
          }
        });
      }
      
      // Calculate similarity score based on:
      // 1. Number of matching genres
      // 2. Rating similarity
      // 3. Year proximity (optional)
      const genreScore = matchingGenres * 10; // Each matching genre is worth 10 points
      const ratingScore = 10 - Math.abs(movie.rating - otherMovie.rating); // Max 10 points for identical ratings
      
      // Optional: Year proximity score
      const yearDiff = Math.abs((movie.year || 2000) - (otherMovie.year || 2000));
      const yearScore = 5 - Math.min(5, yearDiff / 5); // Max 5 points for movies from the same year
      
      const totalScore = genreScore + ratingScore + yearScore;
      
      return {
        movie: otherMovie,
        score: totalScore,
        matchingGenres
      };
    });
    
    // Sort by score and filter out movies with no matching genres
    const sortedMovies = moviesWithScores
      .filter(item => item.matchingGenres > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.movie)
      .slice(0, 5);
    
    res.json(sortedMovies);
  } catch (error) {
    console.error('Error in similar movie recommendations:', error);
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
    
    // If we don't have enough trending movies, get top-rated ones
    if (trendingMovieIds.length < 5) {
      const topRatedMovies = await Movie.find()
        .sort({ rating: -1 })
        .limit(5);
      
      return res.json(topRatedMovies);
    }
    
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
    console.error('Error in trending recommendations:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
