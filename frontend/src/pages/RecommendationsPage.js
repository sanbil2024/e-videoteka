import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const RecommendationsPage = ({ user, addToCart }) => {
  const [personalRecommendations, setPersonalRecommendations] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Fetch trending movies (available to all users)
        const trendingResponse = await axios.get('http://localhost:5000/api/recommendations/trending');
        setTrendingMovies(trendingResponse.data);
        
        // If user is logged in, fetch personalized recommendations
        if (user) {
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          };
          
          const personalResponse = await axios.get(
            'http://localhost:5000/api/recommendations/recommendations',
            config
          );
          
          setPersonalRecommendations(personalResponse.data);
        }
        
        setLoading(false);
      } catch (error) {
        setError('Došlo je do greške prilikom dohvaćanja preporuka.');
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  const MovieCard = ({ movie }) => {
    return (
      <div className="movie-card">
        <Link to={`/movie/${movie._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
          </div>
        </Link>
        <button onClick={() => addToCart(movie)}>Dodaj u košaricu</button>
      </div>
    );
  };

  if (loading) return <div>Učitavanje preporuka...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Preporuke filmova</h1>
      
      {user && personalRecommendations.length > 0 && (
        <section>
          <h2>Preporučeno za vas</h2>
          <p>Ove preporuke su bazirane na vašoj povijesti gledanja i kupovine.</p>
          <div className="movie-grid">
            {personalRecommendations.map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      )}
      
      <section style={{ marginTop: '40px' }}>
        <h2>Trenutno popularno</h2>
        <p>Filmovi koje drugi korisnici najviše gledaju.</p>
        <div className="movie-grid">
          {trendingMovies.map(movie => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      </section>
      
      {!user && (
        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
          <h3>Želite personalizirane preporuke?</h3>
          <p>Prijavite se ili registrirajte kako biste dobili preporuke filmova bazirane na vašim interesima.</p>
          <div style={{ marginTop: '15px' }}>
            <Link to="/login" style={{ 
              padding: '10px 20px', 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              textDecoration: 'none',
              borderRadius: '4px',
              marginRight: '10px'
            }}>
              Prijava
            </Link>
            <Link to="/register" style={{ 
              padding: '10px 20px', 
              backgroundColor: '#2196F3', 
              color: 'white', 
              textDecoration: 'none',
              borderRadius: '4px'
            }}>
              Registracija
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
