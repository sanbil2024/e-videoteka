const mongoose = require('mongoose');

const purchaseSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Movie',
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    lastViewed: {
      type: Date,
      default: null,
    },
    viewCount: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
