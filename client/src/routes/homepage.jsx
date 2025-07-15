import React from 'react';
import HomePage from '../components/HomePage';
import About from '../components/About';
import '../components/App.css';
import { FiArrowRight } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
  const navigate = useNavigate();

  const handleBookNowClick = async () => {
    try {
      const response = await fetch('http://localhost:5000/booking/getStations');
      if (!response.ok) throw new Error('Failed to fetch stations');

      const data = await response.json();
      localStorage.setItem('stationNames', JSON.stringify(data.stationNames)); // consistent key
      navigate('/booking/train/search');
    } catch (error) {
      console.error('Error fetching stations:', error);
      alert('Unable to fetch stations. Please try again later.');
    }
  };

  return (
    <div>
      <HomePage />

      <div className="home-banner-container">
        <div className="home-bannerImage-container">
          <img src={'home-banner-background.png'} alt="Banner" />
        </div>
        <div className="home-text-section" style={{ marginTop: '20px' }}>
          <h1 className="primary-heading">
            Safar Khoobsurat hain manzil se bhi!
          </h1>
          <p className="primary-text">
            Let us help you find the best train tickets for your next trip. At the cheapest you can find!
          </p>
          <button className="secondary-button" onClick={handleBookNowClick}>
            Book Now <FiArrowRight />{" "}
          </button>
        </div>
        <div className="home-image-section">
          <span style={{ marginLeft: '50px', padding: '5px' }}></span>
          <img src={'train2.png'} alt="Train" />
        </div>
      </div>

      <div className="home-image-section">
        <span style={{ marginLeft: '50px' }}></span>
        <img src={'ticket.png'} alt="Ticket" />
      </div>

      <div><About /></div>
    </div>
  );
};

export default Homepage;
