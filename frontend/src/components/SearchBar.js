import React, { useState } from 'react';
import { filterMoviesBySearchTerm } from '../utils/movieUtils';

const SearchBar = ({ movies, setFilteredMovies }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const filtered = filterMoviesBySearchTerm(movies, searchTerm);
    setFilteredMovies(filtered);
  };

  const handleClear = () => {
    setSearchTerm('');
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
        <button type="submit">Pretraži</button>
        {searchTerm && (
          <button type="button" onClick={handleClear}>
            Očisti
          </button>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
