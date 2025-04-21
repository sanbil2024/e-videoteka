import React, { useState } from 'react';

const SearchBar = ({ movies, setFilteredMovies, genres }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    filterMovies();
  };

  const filterMovies = () => {
    let filtered = movies;

    if (searchTerm) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGenre) {
      filtered = filtered.filter(movie =>
        movie.genre.includes(selectedGenre)
      );
    }

    setFilteredMovies(filtered);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedGenre('');
    setFilteredMovies(movies);
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Pretraži filmove..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
        >
          <option value="">Odaberite žanr</option>
          {genres.map((genre, index) => (
            <option key={index} value={genre}>
              {genre}
            </option>
          ))}
        </select>

        <button type="submit">Pretraži</button>

        {(searchTerm || selectedGenre) && (
          <button type="button" onClick={handleClear}>
            Očisti
          </button>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
