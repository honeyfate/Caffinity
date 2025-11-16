import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/CustomerCoffee.css';

const CustomerCoffee = () => {
  const [cart, setCart] = useState([]);
  const [coffeeItems, setCoffeeItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch coffee products from backend
  const fetchCoffeeProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/products/coffee');
      setCoffeeItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching coffee products:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoffeeProducts();
  }, []);

  const addToCart = (item) => {
    setCart([...cart, { ...item, quantity: 1 }]);
    alert(`${item.name} added to cart!`);
  };

  // Format price to Philippine Peso format
  const formatPrice = (price) => {
    return `₱${parseFloat(price).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="customer-coffee">
        <div className="page-header">
          <h1>Our Coffee Selection</h1>
          <p>Loading coffee products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-coffee">
      <div className="page-header">
        <h1>Our Coffee Selection</h1>
        <p>Handcrafted with passion, served with perfection</p>
      </div>

      <div className="items-grid">
        {coffeeItems.length === 0 ? (
          <div className="no-products">
            <p>No coffee products available yet. Check back soon!</p>
          </div>
        ) : (
          coffeeItems.map(item => (
            <div key={item.id} className="item-card">
              <div className="card-image-container">
                {item.imageUrl ? (
                  <img 
                    src={`http://localhost:8080${item.imageUrl}`} 
                    alt={item.name} 
                    className="item-image" 
                  />
                ) : (
                  <div className="image-placeholder">No Image</div>
                )}
                <div className="item-type-badge">{item.category}</div>
              </div>
              <div className="card-content">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-description">{item.description}</p>
                <div className="card-footer">
                  <span className="item-price">{formatPrice(item.price)}</span>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(item)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="cart-summary">
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Cart Summary</h3>
          </div>
          <div className="card-content">
            <p>Items in cart: {cart.length}</p>
            <div className="cart-items">
              {cart.map((item, index) => (
                <div key={index} className="cart-item">
                  <span>{item.name}</span>
                  <span>{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card-actions">
            <button className="card-btn">View Cart</button>
            <button className="card-btn secondary">Continue Shopping</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCoffee;