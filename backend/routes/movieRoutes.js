const express = require('express');
const router = express.Router();
const Movie = require('../models/movieModel');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Fetch all movies
// @route   GET /api/movies
// @access  Public
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find({});
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Fetch single movie
// @route   GET /api/movies/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a movie review
// @route   POST /api/movies/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const movie = await Movie.findById(req.params.id);

    if (movie) {
      const alreadyReviewed = movie.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        res.status(400).json({ message: 'Movie already reviewed' });
        return;
      }

      const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
      };

      movie.reviews.push(review);

      movie.rating =
        movie.reviews.reduce((acc, item) => item.rating + acc, 0) /
        movie.reviews.length;

      await movie.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get recommended movies
// @route   GET /api/movies/recommended/:id
// @access  Public
router.get('/recommended/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (movie) {
      // Get movies with similar genres
      const recommendedMovies = await Movie.find({
        _id: { $ne: movie._id },
        genre: { $in: movie.genre }
      }).limit(5);
      
      res.json(recommendedMovies);
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get top rated movies
// @route   GET /api/movies/top
// @access  Public
router.get('/top', async (req, res) => {
  try {
    const movies = await Movie.find({}).sort({ rating: -1 }).limit(5);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
