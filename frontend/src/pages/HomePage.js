import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

const HomePage = ({ addToCart, user }) => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [newMovies, setNewMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [allGenres, setAllGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchActive, setSearchActive] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/movies');
        setMovies(data);
        setFilteredMovies(data);

        const sortedByYear = [...data].sort((a, b) => b.year - a.year);
        setNewMovies(sortedByYear.slice(0, 5));

        const sortedByRating = [...data].sort((a, b) => b.rating - a.rating);
        setTopRatedMovies(sortedByRating.slice(0, 5));

        const genres = [...new Set(data.flatMap(movie => movie.genre))];
        setAllGenres(genres);

        if (user) {
          try {
            const config = {
              headers: {
                Authorization: `Bearer ${user.token}`
              }
            };
            const res = await axios.get('http://localhost:5000/api/recommendations', config);
            setPersonalizedRecommendations(res.data);
          } catch (err) {
            console.error('Greška pri dohvaćanju preporuka:', err);
          }
        } else {
          try {
            const res = await axios.get('http://localhost:5000/api/recommendations/trending');
            setTrendingMovies(res.data);
          } catch (err) {
            console.error('Greška pri dohvaćanju trending filmova:', err);
          }
        }

        setLoading(false);
      } catch (error) {
        setError('Došlo je do greške prilikom dohvaćanja filmova.');
        setLoading(false);
      }
    };

    fetchMovies();
  }, [user]);

  const MovieCard = ({ movie }) => (
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

  const handleSearch = (filtered) => {
    setFilteredMovies(filtered);
    setSearchActive(filtered.length !== movies.length);
  };

  if (loading) return <div>Učitavanje...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <SearchBar
        movies={movies}
        setFilteredMovies={handleSearch}
        genres={allGenres}
      />

      {searchActive ? (
        <section>
          <h2>Rezultati pretraživanja ({filteredMovies.length})</h2>
          {filteredMovies.length === 0 ? (
            <p>Nema rezultata za vaše pretraživanje.</p>
          ) : (
            <div className="movie-grid">
              {filteredMovies.map(movie => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Preporučeno za prijavljene korisnike */}
          {user && personalizedRecommendations.length > 0 && (
            <section>
              <h2>Preporučeno za vas</h2>
              <div className="movie-grid">
                {personalizedRecommendations.map(movie => (
                  <MovieCard key={movie._id} movie={movie} />
                ))}
              </div>
            </section>
          )}

          {/* Trending za goste */}
          {!user && trendingMovies.length > 0 && (
            <section>
              <h2>Trending</h2>
              <div className="movie-grid">
                {trendingMovies.map(movie => (
                  <MovieCard key={movie._id} movie={movie} />
                ))}
              </div>
            </section>
          )}

          <section style={{ marginTop: '40px' }}>
            <h2>Novi filmovi</h2>
            <div className="movie-grid">
              {newMovies.map(movie => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>

          <section style={{ marginTop: '40px' }}>
            <h2>Najbolje ocijenjeni filmovi</h2>
            <div className="movie-grid">
              {topRatedMovies.map(movie => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default HomePage;
