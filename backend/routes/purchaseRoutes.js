const express = require('express');
const router = express.Router();
const Purchase = require('../models/purchaseModel');
const { protect } = require('../middleware/authMiddleware');

// @desc    Purchase a movie
// @route   POST /api/purchases
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { movieId } = req.body;

    // Check if user already purchased this movie
    const existingPurchase = await Purchase.findOne({
      user: req.user._id,
      movie: movieId,
      expiryDate: { $gt: Date.now() } // Not expired
    });

    if (existingPurchase) {
      return res.status(400).json({ message: 'Film je već kupljen i dostupan za gledanje' });
    }

    // Set expiry date to 30 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const purchase = new Purchase({
      user: req.user._id,
      movie: movieId,
      expiryDate
    });

    const createdPurchase = await purchase.save();
    res.status(201).json(createdPurchase);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get user's purchased movies
// @route   GET /api/purchases
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const purchases = await Purchase.find({ user: req.user._id })
      .populate('movie')
      .sort({ purchaseDate: -1 });
    
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Record movie viewing
// @route   POST /api/purchases/:id/view
// @access  Private
router.post('/:id/view', protect, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({ message: 'Kupnja nije pronađena' });
    }
    
    // Check if purchase belongs to user
    if (purchase.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Nije autorizirano' });
    }
    
    // Check if purchase is expired
    if (purchase.expiryDate < Date.now()) {
      return res.status(400).json({ message: 'Pristup filmu je istekao' });
    }
    
    // Update viewing information
    purchase.lastViewed = Date.now();
    purchase.viewCount += 1;
    
    const updatedPurchase = await purchase.save();
    res.json(updatedPurchase);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
