import React, { useState } from 'react';
import axios from 'axios';
import { Rating } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

const ReviewForm = ({ movieId, user, onReviewAdded }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Morate biti prijavljeni da biste ostavili recenziju.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.post(
        `http://localhost:5000/api/reviews/${movieId}/reviews`,
        { rating, comment },
        config
      );

      // Clear form and notify parent component
      setRating(5);
      setComment('');
      setSubmitting(false);
      
      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Došlo je do greške prilikom slanja recenzije.'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="review-form">
      <h3>Napišite recenziju</h3>
      
      {error && <div style={{ color: '#f50057', marginBottom: '15px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="rating">Ocjena</label>
          <div>
            <Rating
              name="rating"
              value={rating}
              precision={1}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
              emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="comment">Komentar</label>
          <textarea 
            id="comment" 
            value={comment} 
            onChange={(e) => setComment(e.target.value)}
            required
            rows={4}
            style={{ width: '100%', padding: '8px' }}
          ></textarea>
        </div>
        
        <button 
          type="submit" 
          className="form-submit"
          disabled={submitting}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1
          }}
        >
          {submitting ? 'Slanje...' : 'Pošalji recenziju'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
