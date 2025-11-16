import React, { useState } from 'react';
import '../css/CustomerCoffee.css';

const CustomerCoffee = () => {
  const [cart, setCart] = useState([]);

  const coffeeItems = [
    { id: 1, name: 'Cappuccino', description: 'Rich espresso with steamed milk foam and a touch of cinnamon', price: '₱125.00', image: '/images/cappuccino.jpeg', type: 'Hot Coffee' },
    { id: 2, name: 'Espresso', description: 'Pure Italian espresso shot with perfect crema', price: '₱90.00', image: '/images/espresso.jpeg', type: 'Hot Coffee' },
    { id: 3, name: 'Iced Caramel Macchiato', description: 'Espresso with vanilla-flavored syrup, milk, and caramel drizzle over ice', price: '₱170.00', image: '/images/caramel-macchiato.jpeg', type: 'Iced Coffee' },
    { id: 4, name: 'Latte', description: 'Smooth espresso with steamed milk and a light foam layer', price: '₱130.00', image: '/images/latte.jpeg', type: 'Hot Coffee' },
    { id: 5, name: 'Mocha', description: 'Chocolate-flavored espresso drink topped with whipped cream', price: '₱150.00', image: '/images/mocha.jpeg', type: 'Hot Coffee' },
    { id: 6, name: 'Cold Brew', description: 'Slow-steeped coffee served chilled for a bold and smooth flavor', price: '₱160.00', image: '/images/cold-brew.jpeg', type: 'Iced Coffee' },
  ];

  const addToCart = (item) => {
    setCart([...cart, { ...item, quantity: 1 }]);
    alert(`${item.name} added to cart!`);
  };

  return (
    <div className="customer-coffee">
      <div className="page-header">
        <h1>Our Coffee Selection</h1>
        <p>Handcrafted with passion, served with perfection</p>
      </div>

      <div className="items-grid">
        {coffeeItems.map(item => (
          <div key={item.id} className="item-card">
            <div className="card-image-container">
              <img src={item.image} alt={item.name} className="item-image" />
              <div className="item-type-badge">{item.type}</div>
            </div>
            <div className="card-content">
              <h3 className="item-name">{item.name}</h3>
              <p className="item-description">{item.description}</p>
              <div className="card-footer">
                <span className="item-price">{item.price}</span>
                <button 
                  className="add-to-cart-btn"
                  onClick={() => addToCart(item)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
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
                  <span>{item.price}</span>
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