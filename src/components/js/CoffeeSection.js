import React, { useState, useEffect } from 'react';
import '../css/CoffeeSection.css';
import cappuccinoImg from '../../cappuccino.jpeg';
import espressoImg from '../../espresso.jpeg';
import caramelMacchiatoImg from '../../caramel-macchiato.jpeg';

const coffeeItems = [
  {
    id: 1,
    name: 'Cappuccino',
    description: 'Rich espresso with steamed milk foam and a touch of cinnamon',
    price: '₱125.00',
    image: cappuccinoImg,
  },
  {
    id: 2,
    name: 'Espresso',
    description: 'Pure Italian espresso shot with perfect crema',
    price: '₱90.00',
    image: espressoImg,
  },
  {
    id: 3,
    name: 'Iced Caramel Macchiato',
    description: 'Espresso with vanilla-flavored syrup, milk, and caramel drizzle over ice',
    price: '₱170.00',
    image: caramelMacchiatoImg,
  },
];

const CoffeeSection = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isEditing) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [isEditing]);

  const handleEditClick = (item) => {
    setCurrentItem(item);
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    setCurrentItem(null);
  };

  const handleSave = () => {
    // Save logic here (e.g., update state or send data to backend)
    setIsEditing(false);
    setCurrentItem(null);
  };

  return (
    <section id="coffee" className={`coffee-section ${isEditing ? 'editing-mode' : ''}`}>
      <h2 className="section-title">Admin Mode</h2>
      <div className="coffee-cards">
        {coffeeItems.map((item) => (
          <div
            key={item.id}
            className={`coffee-card ${currentItem?.id === item.id ? 'active-card' : ''}`}
          >
            <img src={item.image} alt={item.name} className="coffee-image" />
            <h3 className="coffee-name">{item.name}</h3>
            <p className="coffee-description">{item.description}</p>
            <p className="coffee-price">{item.price}</p>
            <button className="edit-menu-button" onClick={() => handleEditClick(item)}>
              Edit Menu
            </button>
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="exit-button" onClick={handleCloseModal}>×</button>
            <h3>Edit Product</h3>
            <p className="modal-subtitle">Make changes to the product details below</p>

            <div className="image-upload-container">
              <label htmlFor="imageUpload">
                <img
                  src={currentItem.image}
                  alt={currentItem.name}
                  className="modal-image"
                />
                <div className="image-overlay">Change Image</div>
              </label>
              <input id="imageUpload" type="file" style={{ display: 'none' }} />
            </div>

            <input type="text" defaultValue={currentItem.name} className="modal-input" placeholder="Product Name" />
            <textarea defaultValue={currentItem.description} className="modal-input" placeholder="Description" />
            <input type="text" defaultValue={currentItem.price} className="modal-input" placeholder="Price" />

            <div className="modal-actions">
              <button className="cancel-button" onClick={handleCloseModal}>Cancel</button>
              <button className="save-button" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CoffeeSection;
