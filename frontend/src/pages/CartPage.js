import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CartPage = ({ cart, removeFromCart, updateCartQuantity, user, purchaseMovies }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  // Calculate total price
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Handle checkout
  const checkoutHandler = async () => {
    if (!user) {
      alert('Morate biti prijavljeni da biste dovršili kupnju.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const success = await purchaseMovies();
      
      if (success) {
        alert('Hvala na kupnji! Filmovi su dodani u vašu kolekciju.');
        navigate('/purchased');
      }
    } catch (error) {
      alert('Došlo je do greške prilikom kupnje.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="cart">
      <h1>Košarica</h1>
      
      {cart.length === 0 ? (
        <div>
          <p>Vaša košarica je prazna.</p>
          <Link to="/">Povratak na početnu stranicu</Link>
        </div>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item._id} className="cart-item">
              <div className="cart-item-info">
                <img 
                  src={`/images/${item.image}`} 
                  alt={item.title} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/60x80?text=Nema+slike';
                  }}
                />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.price.toFixed(2)} € po filmu</p>
                </div>
              </div>
              
              <div className="cart-item-actions">
                <div>
                  <button 
                    onClick={() => updateCartQuantity(item._id, item.quantity - 1)}
                    disabled={isProcessing}
                  >
                    -
                  </button>
                  <span style={{ margin: '0 10px' }}>{item.quantity}</span>
                  <button 
                    onClick={() => updateCartQuantity(item._id, item.quantity + 1)}
                    disabled={isProcessing}
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={() => removeFromCart(item._id)}
                  disabled={isProcessing}
                >
                  Ukloni
                </button>
              </div>
            </div>
          ))}
          
          <div className="cart-summary">
            <div className="cart-total">
              <span>Ukupno:</span>
              <span>{totalPrice.toFixed(2)} €</span>
            </div>
            
            <button 
              className="checkout-button"
              onClick={checkoutHandler}
              disabled={isProcessing}
            >
              {isProcessing ? 'Obrada u tijeku...' : 'Kupi filmove'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
