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

      // Find the purchase in state
      const purchase = purchases.find(p => p._id === purchaseId);
      
      // Set as currently watching
      setCurrentlyWatching(purchase);
      
      // Update purchases list with new view count
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
      <div>
        <h1>Kupljeni filmovi</h1>
        <p>Morate biti prijavljeni da biste vidjeli svoje kupljene filmove.</p>
      </div>
    );
  }

  if (loading) return <div>Učitavanje...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
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
        <>
          {purchases.length === 0 ? (
            <p>Još niste kupili nijedan film.</p>
          ) : (
            <div className="purchases-list">
              {purchases.map((purchase) => (
                <div key={purchase._id} className="purchase-item" style={{
                  backgroundColor: '#1e1e1e',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div className="purchase-info" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img 
                      src={`/images/${purchase.movie.image}`} 
                      alt={purchase.movie.title} 
                      style={{ width: '80px', height: '120px', objectFit: 'cover', borderRadius: '4px' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/80x120?text=Nema+slike';
                      }}
                    />
                    <div>
                      <h3>
                        <Link to={`/movie/${purchase.movie._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {purchase.movie.title}
                        </Link>
                      </h3>
                      <p>Kupljeno: {formatDate(purchase.purchaseDate)}</p>
                      <p>Dostupno do: {formatDate(purchase.expiryDate)}</p>
                      {purchase.lastViewed && (
                        <p>Zadnje gledano: {formatDate(purchase.lastViewed)}</p>
                      )}
                      <p>Broj gledanja: {purchase.viewCount}</p>
                    </div>
                  </div>
                  <div>
                    <button 
                      onClick={() => handleWatchMovie(purchase._id)}
                      disabled={isExpired(purchase.expiryDate)}
                      style={{ 
                        opacity: isExpired(purchase.expiryDate) ? 0.5 : 1,
                        cursor: isExpired(purchase.expiryDate) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isExpired(purchase.expiryDate) ? 'Isteklo' : 'Gledaj film'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PurchasedMoviesPage;
