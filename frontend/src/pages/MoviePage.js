import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReviewForm from '../components/ReviewForm';
import ReviewsList from '../components/ReviewsList';

const MoviePage = ({ addToCart, user }) => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshReviews, setRefreshReviews] = useState(0);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/movies/${id}`);
        setMovie(data);
        setLoading(false);
        
        // Fetch recommended movies
        try {
          const { data: recommendedData } = await axios.get(`http://localhost:5000/api/recommendations/recommended/${id}`);
          setRecommendedMovies(recommendedData);
        } catch (error) {
          console.error('Error fetching recommendations:', error);
        }
      } catch (error) {
        setError('Došlo je do greške prilikom dohvaćanja filma.');
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id, refreshReviews]);

  const handleReviewAdded = () => {
    // Trigger a refresh of the movie data and reviews
    setRefreshReviews(prev => prev + 1);
  };

  const handleReviewDeleted = () => {
    // Trigger a refresh of the movie data and reviews
    setRefreshReviews(prev => prev + 1);
  };

  if (loading) return <div>Učitavanje...</div>;
  if (error) return <div>{error}</div>;
  if (!movie) return <div>Film nije pronađen.</div>;

  return (
    <div>
      <div className="movie-details">
        <div className="movie-poster">
          <img 
            src={`/images/${movie.image}`} 
            alt={movie.title} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/300x450?text=Nema+slike';
            }}
          />
        </div>
        
        <div className="movie-info">
          <h1>{movie.title} ({movie.year})</h1>
          <div className="meta">
            <p>Redatelj: {movie.director}</p>
            <p>Žanr: {movie.genre.join(', ')}</p>
            <p>Ocjena: {movie.rating}/10</p>
            <p>Trajanje: {movie.duration} min</p>
          </div>
          
          <div className="description">
            <p>{movie.description}</p>
          </div>
          
          <div className="actors">
            <p><strong>Glumci:</strong> {movie.actors.join(', ')}</p>
          </div>
          
          <div className="price">
            <p>{movie.price.toFixed(2)} €</p>
          </div>
          
          <button className="add-to-cart" onClick={() => addToCart(movie)}>
            Dodaj u košaricu
          </button>
        </div>
      </div>
      
      {/* Reviews section */}
      <div className="reviews">
        <h2>Recenzije</h2>
        
        {/* Reviews list */}
        <ReviewsList 
          movieId={id} 
          onReviewDeleted={handleReviewDeleted} 
        />
        
        {/* Review form */}
        {user && (
          <ReviewForm 
            movieId={id} 
            user={user} 
            onReviewAdded={handleReviewAdded} 
          />
        )}
      </div>
      
      {/* Recommended movies */}
      {recommendedMovies.length > 0 && (
        <div className="recommended-movies">
          <h2>Preporučeni filmovi</h2>
          <div className="movie-grid">
            {recommendedMovies.map(movie => (
              <div key={movie._id} className="movie-card">
                <img 
                  src={`/images/${movie.image}`} 
                  alt={movie.title} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/300x450?text=Nema+slike';
                  }}
                />
                <div className="movie-card-content">
                  <h3>{movie.title}</h3>
                  <p>{movie.year} • Ocjena: {movie.rating}/10</p>
                  <p className="price">{movie.price.toFixed(2)} €</p>
                  <button onClick={() => addToCart(movie)}>Dodaj u košaricu</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoviePage;
