import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './index.css';

// Components
import HomePage from './pages/HomePage';
import MoviePage from './pages/MoviePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import PurchasedMoviesPage from './pages/PurchasedMoviesPage';
import RecommendationsPage from './pages/RecommendationsPage';

function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  
  // Check for logged in user on app load
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  // Load cart from localStorage on app load
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Add movie to cart
  const addToCart = (movie) => {
    const existingItem = cart.find(item => item._id === movie._id);
    
    if (existingItem) {
      setCart(
        cart.map(item =>
          item._id === movie._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...movie, quantity: 1 }]);
    }
  };

  // Remove movie from cart
  const removeFromCart = (id) => {
    setCart(cart.filter(item => item._id !== id));
  };

  // Update quantity in cart
  const updateCartQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(
        cart.map(item =>
          item._id === id
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  // Purchase movies from cart
  const purchaseMovies = async () => {
    if (!user) {
      alert('Morate biti prijavljeni da biste kupili filmove.');
      return false;
    }
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      // Purchase each movie in cart
      for (const item of cart) {
        await axios.post(
          'http://localhost:5000/api/purchases',
          { movieId: item._id },
          config
        );
      }
      
      // Clear cart after successful purchase
      setCart([]);
      return true;
    } catch (error) {
      alert('Došlo je do greške prilikom kupnje filmova.');
      return false;
    }
  };

  // Login handler
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <Router>
      <div className="App">
        <header className="header">
          <h1><Link to="/" style={{ textDecoration: 'none', color: 'white' }}>E-Videoteka</Link></h1>
          <nav className="nav">
            <Link to="/">Početna</Link>
            <Link to="/cart">Košarica ({cart.reduce((acc, item) => acc + item.quantity, 0)})</Link>
            {user ? (
              <>
                <Link to="/profile">Profil</Link>
                <Link to="/purchased">Moji filmovi</Link>
                <Link to="/" onClick={logout}>Odjava</Link>
              </>
            ) : (
              <Link to="/login">Prijava</Link>
            )}
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<HomePage addToCart={addToCart} user={user} />} />
          <Route path="/movie/:id" element={<MoviePage addToCart={addToCart} user={user} />} />
          <Route path="/login" element={<LoginPage login={login} />} />
          <Route path="/register" element={<RegisterPage login={login} />} />
          <Route path="/cart" element={
            <CartPage 
              cart={cart} 
              removeFromCart={removeFromCart} 
              updateCartQuantity={updateCartQuantity} 
              user={user}
              purchaseMovies={purchaseMovies}
            />
          } />
          <Route path="/profile" element={<ProfilePage user={user} addToCart={addToCart} />} />
          <Route path="/purchased" element={<PurchasedMoviesPage user={user} />} />
          <Route path="/recommendations" element={<RecommendationsPage user={user} addToCart={addToCart} />} />
        </Routes>

        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} E-Videoteka. Sva prava pridržana.</p>
          <p>Autor: Sandro Bilandžić</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
