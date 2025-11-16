import React, { useState } from 'react';
import '../css/CustomerDesserts.css';

const CustomerDesserts = () => {
  const [cart, setCart] = useState([]);

  const dessertItems = [
    { id: 1, name: 'Classic Tiramisu', description: 'Layers of coffee-soaked ladyfingers and mascarpone cream', price: '₱180.00', image: '/images/tiramisu.jpeg', type: 'Italian Dessert' },
    { id: 2, name: 'New York Cheesecake', description: 'Creamy cheesecake with graham cracker crust and berry compote', price: '₱160.00', image: '/images/cheesecake.jpeg', type: 'Cheesecake' },
    { id: 3, name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten chocolate center, served with vanilla ice cream', price: '₱190.00', image: '/images/chocolate-cake.jpeg', type: 'Chocolate Dessert' },
    { id: 4, name: 'Butter Croissant', description: 'Flaky, buttery French croissant perfect with any coffee', price: '₱95.00', image: '/images/croissant.jpeg', type: 'Pastry' },
    { id: 5, name: 'French Macarons', description: 'Assorted flavors of delicate almond meringue cookies', price: '₱220.00', image: '/images/macarons.jpeg', type: 'Cookies' },
    { id: 6, name: 'Walnut Brownie', description: 'Rich chocolate brownie with walnuts, served warm', price: '₱120.00', image: '/images/brownie.jpeg', type: 'Brownie' },
  ];

  const addToCart = (item) => {
    setCart([...cart, { ...item, quantity: 1 }]);
    alert(`${item.name} added to cart!`);
  };

  return (
    <div className="customer-desserts">
      <div className="page-header">
        <h1>Sweet Delights</h1>
        <p>Indulge in our exquisite desserts made with love</p>
      </div>

      <div className="items-grid">
        {dessertItems.map(item => (
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

export default CustomerDesserts;