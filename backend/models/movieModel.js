const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const movieSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    director: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    genre: {
      type: [String],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    duration: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    trailer: {
      type: String,
      required: true,
    },
    actors: {
      type: [String],
      required: true,
    },
    reviews: [reviewSchema],
  },
  {
    timestamps: true,
  }
);

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
