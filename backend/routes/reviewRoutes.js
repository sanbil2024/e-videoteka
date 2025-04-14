const express = require('express');
const router = express.Router();
const Movie = require('../models/movieModel');
const { protect } = require('../middleware/authMiddleware');

// @desc    Add a review to a movie
// @route   POST /api/movies/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Ocjena i komentar su obavezni' });
    }
    
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Film nije pronađen' });
    }
    
    // Check if user already reviewed this movie
    const alreadyReviewed = movie.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );
    
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Već ste recenzirali ovaj film' });
    }
    
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };
    
    movie.reviews.push(review);
    
    // Update movie rating
    movie.numReviews = movie.reviews.length;
    movie.rating = movie.reviews.reduce((acc, item) => item.rating + acc, 0) / movie.reviews.length;
    
    await movie.save();
    res.status(201).json({ message: 'Recenzija je dodana' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all reviews for a movie
// @route   GET /api/movies/:id/reviews
// @access  Public
router.get('/:id/reviews', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Film nije pronađen' });
    }
    
    res.json(movie.reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a review
// @route   DELETE /api/movies/:id/reviews/:reviewId
// @access  Private
router.delete('/:id/reviews/:reviewId', protect, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Film nije pronađen' });
    }
    
    // Find the review to delete
    const review = movie.reviews.find(
      (r) => r._id.toString() === req.params.reviewId
    );
    
    if (!review) {
      return res.status(404).json({ message: 'Recenzija nije pronađena' });
    }
    
    // Check if the review belongs to the user
    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Nije autorizirano' });
    }
    
    // Remove the review
    movie.reviews = movie.reviews.filter(
      (r) => r._id.toString() !== req.params.reviewId
    );
    
    // Update movie rating
    if (movie.reviews.length > 0) {
      movie.numReviews = movie.reviews.length;
      movie.rating = movie.reviews.reduce((acc, item) => item.rating + acc, 0) / movie.reviews.length;
    } else {
      movie.numReviews = 0;
      movie.rating = 0;
    }
    
    await movie.save();
    res.json({ message: 'Recenzija je obrisana' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
