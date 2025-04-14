import React from 'react';

// Utility function to calculate recommendations based on user's watch history and preferences
export const getRecommendedMovies = (movies, userHistory = [], userFavorites = []) => {
  if (!movies || movies.length === 0) {
    return [];
  }

  // If user has no history or favorites, return top rated movies
  if (userHistory.length === 0 && userFavorites.length === 0) {
    return movies
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  }

  // Get genres from user's history and favorites
  const userGenres = new Map();
  
  // Process history
  userHistory.forEach(movieId => {
    const movie = movies.find(m => m._id === movieId);
    if (movie) {
      movie.genre.forEach(genre => {
        userGenres.set(genre, (userGenres.get(genre) || 0) + 1);
      });
    }
  });
  
  // Process favorites (with higher weight)
  userFavorites.forEach(movieId => {
    const movie = movies.find(m => m._id === movieId);
    if (movie) {
      movie.genre.forEach(genre => {
        userGenres.set(genre, (userGenres.get(genre) || 0) + 2);
      });
    }
  });
  
  // Sort genres by frequency
  const sortedGenres = [...userGenres.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  // Filter out movies that user has already watched or favorited
  const unwatchedMovies = movies.filter(
    movie => !userHistory.includes(movie._id) && !userFavorites.includes(movie._id)
  );
  
  // Score each movie based on genre match
  const scoredMovies = unwatchedMovies.map(movie => {
    let score = 0;
    
    // Add points for each matching genre, weighted by genre preference
    movie.genre.forEach(genre => {
      const genreIndex = sortedGenres.indexOf(genre);
      if (genreIndex !== -1) {
        // More points for higher ranked genres
        score += (sortedGenres.length - genreIndex);
      }
    });
    
    // Add points for rating
    score += movie.rating / 2;
    
    return { ...movie, score };
  });
  
  // Sort by score and return top recommendations
  return scoredMovies
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
};

// Utility function to format date
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('hr-HR');
};

// Utility function to calculate total price
export const calculateTotal = (items) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

// Utility function to filter movies by search term
export const filterMoviesBySearchTerm = (movies, searchTerm) => {
  if (!searchTerm) return movies;
  
  const term = searchTerm.toLowerCase();
  return movies.filter(
    movie => 
      movie.title.toLowerCase().includes(term) ||
      movie.director.toLowerCase().includes(term) ||
      movie.genre.some(g => g.toLowerCase().includes(term)) ||
      movie.actors.some(a => a.toLowerCase().includes(term))
  );
};

// Utility function to filter movies by genre
export const filterMoviesByGenre = (movies, genre) => {
  if (!genre) return movies;
  
  return movies.filter(movie => movie.genre.includes(genre));
};

// Utility function to sort movies
export const sortMovies = (movies, sortBy) => {
  if (!sortBy) return movies;
  
  const sortedMovies = [...movies];
  
  switch (sortBy) {
    case 'title':
      return sortedMovies.sort((a, b) => a.title.localeCompare(b.title));
    case 'year':
      return sortedMovies.sort((a, b) => b.year - a.year);
    case 'rating':
      return sortedMovies.sort((a, b) => b.rating - a.rating);
    case 'price':
      return sortedMovies.sort((a, b) => a.price - b.price);
    default:
      return sortedMovies;
  }
};
