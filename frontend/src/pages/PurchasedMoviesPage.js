import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const PurchasedMoviesPage = ({ user }) => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentlyWatching, setCurrentlyWatching] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchPurchases = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.get(
          'http://localhost:5000/api/purchases',
          config
        );

        setPurchases(data);
        setLoading(false);
      } catch (error) {
        setError('Došlo je do greške prilikom dohvaćanja kupljenih filmova.');
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [user]);

  const handleWatchMovie = async (purchaseId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.post(
        `http://localhost:5000/api/purchases/${purchaseId}/view`,
        {},
        config
      );

      const purchase = purchases.find(p => p._id === purchaseId);
      setCurrentlyWatching(purchase);

      setPurchases(
        purchases.map(p =>
          p._id === purchaseId
            ? { ...p, viewCount: p.viewCount + 1, lastViewed: new Date() }
            : p
        )
      );
    } catch (error) {
      alert('Došlo je do greške prilikom gledanja filma.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hr-HR');
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  if (!user) {
    return (
      <div className="purchased-container">
        <h1>Kupljeni filmovi</h1>
        <p>Morate biti prijavljeni da biste vidjeli svoje kupljene filmove.</p>
      </div>
    );
  }

  if (loading) return <div className="purchased-container">Učitavanje...</div>;
  if (error) return <div className="purchased-container">{error}</div>;

  return (
    <div className="purchased-container">
      <h1>Kupljeni filmovi</h1>
      {currentlyWatching ? (
        <div className="movie-player">
          <h2>Gledate: {currentlyWatching.movie.title}</h2>
          <div className="video-container" style={{
            backgroundColor: '#000',
            height: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <p style={{ color: '#fff' }}>
              Ovo je simulacija gledanja filma. U stvarnoj aplikaciji, ovdje bi bio video player.
            </p>
          </div>
          <button 
            onClick={() => setCurrentlyWatching(null)}
            style={{ marginBottom: '30px' }}
          >
            Završi gledanje
          </button>
        </div>
      ) : (
        purchases.length === 0 ? (
          <p>Još niste kupili nijedan film.</p>
        ) : (
          <div className="purchased-list">
            {purchases.map((purchase) => (
              <div key={purchase._id} className="purchased-card">
                <img
                  src={`/images/${purchase.movie.image}`}
                  alt={purchase.movie.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/300x450?text=Nema+slike';
                  }}
                />
                <div className="purchased-card-content">
                  <h3>
                    <Link to={`/movie/${purchase.movie._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {purchase.movie.title}
                    </Link>
                  </h3>
                  <p>Kupljeno: {formatDate(purchase.purchaseDate)}</p>
                  <p>Istek: {formatDate(purchase.expiryDate)}</p>
                  <p>Broj gledanja: {purchase.viewCount}</p>
                  <button
                    onClick={() => handleWatchMovie(purchase._id)}
                    disabled={isExpired(purchase.expiryDate)}
                    style={{
                      marginTop: '10px',
                      width: '100%',
                      padding: '8px',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isExpired(purchase.expiryDate) ? 'not-allowed' : 'pointer',
                      opacity: isExpired(purchase.expiryDate) ? 0.5 : 1,
                    }}
                  >
                    {isExpired(purchase.expiryDate) ? 'Isteklo' : 'Gledaj film'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default PurchasedMoviesPage;
