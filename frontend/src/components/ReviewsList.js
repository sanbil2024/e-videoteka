import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Rating } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

const ReviewsList = ({ movieId, onReviewDeleted }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user info from localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }

    // Fetch reviews
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/reviews/${movieId}/reviews`);
        setReviews(data);
        setLoading(false);
      } catch (error) {
        setError('Došlo je do greške prilikom dohvaćanja recenzija.');
        setLoading(false);
      }
    };

    fetchReviews();
  }, [movieId]);

  const handleDeleteReview = async (reviewId) => {
    if (!user) return;
    
    if (window.confirm('Jeste li sigurni da želite obrisati ovu recenziju?')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        await axios.delete(
          `http://localhost:5000/api/reviews/${movieId}/reviews/${reviewId}`,
          config
        );

        // Update reviews list
        setReviews(reviews.filter(review => review._id !== reviewId));
        
        if (onReviewDeleted) {
          onReviewDeleted();
        }
      } catch (error) {
        alert('Došlo je do greške prilikom brisanja recenzije.');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('hr-HR', options);
  };

  if (loading) return <div>Učitavanje recenzija...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="reviews-list">
      <h3>Recenzije korisnika</h3>
      
      {reviews.length === 0 ? (
        <p>Još nema recenzija za ovaj film. Budite prvi koji će napisati recenziju!</p>
      ) : (
        <>
          {reviews.map((review) => (
            <div key={review._id} className="review-item" style={{
              backgroundColor: '#1e1e1e',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <div className="review-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <div>
                  <strong>{review.name}</strong>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Rating
                      value={review.rating}
                      readOnly
                      precision={0.5}
                      size="small"
                      emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                    />
                    <span style={{ marginLeft: '5px' }}>
                      {review.rating}/5
                    </span>
                  </div>
                  <small>{review.createdAt ? formatDate(review.createdAt) : 'Nepoznat datum'}</small>
                </div>
                
                {user && (user._id === review.user || user.isAdmin) && (
                  <button 
                    onClick={() => handleDeleteReview(review._id)}
                    style={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '5px 10px',
                      cursor: 'pointer'
                    }}
                  >
                    Obriši
                  </button>
                )}
              </div>
              
              <div className="review-content">
                <p>{review.comment}</p>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ReviewsList;
