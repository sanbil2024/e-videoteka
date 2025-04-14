const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        favoriteMovies: user.favoriteMovies,
        watchHistory: user.watchHistory,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        favoriteMovies: user.favoriteMovies,
        watchHistory: user.watchHistory,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        favoriteMovies: user.favoriteMovies,
        watchHistory: user.watchHistory,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        favoriteMovies: updatedUser.favoriteMovies,
        watchHistory: updatedUser.watchHistory,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Add movie to favorites
// @route   POST /api/users/favorites
// @access  Private
router.post('/favorites', protect, async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      // Check if movie is already in favorites
      if (user.favoriteMovies.includes(movieId)) {
        res.status(400).json({ message: 'Movie already in favorites' });
        return;
      }

      user.favoriteMovies.push(movieId);
      await user.save();
      
      res.json(user.favoriteMovies);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Add movie to watch history
// @route   POST /api/users/history
// @access  Private
router.post('/history', protect, async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      // Check if movie is already in watch history
      if (user.watchHistory.includes(movieId)) {
        // Move it to the end of the array to indicate it was watched most recently
        user.watchHistory.pull(movieId);
      }

      user.watchHistory.push(movieId);
      await user.save();
      
      res.json(user.watchHistory);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
