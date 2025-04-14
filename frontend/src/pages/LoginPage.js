import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = ({ login }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/users/login',
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      login(data);
      setLoading(false);
      navigate('/');
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Došlo je do greške prilikom prijave.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Prijava</h2>
      
      {error && <div style={{ color: '#f50057', marginBottom: '15px' }}>{error}</div>}
      
      <form onSubmit={submitHandler}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Lozinka</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="form-submit"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Prijava u tijeku...' : 'Prijavi se'}
        </button>
      </form>
      
      <Link to="/register" className="auth-link">
        Nemaš račun? Registriraj se
      </Link>
    </div>
  );
};

export default LoginPage;
