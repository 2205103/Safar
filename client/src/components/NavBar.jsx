import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsFillTrainFreightFrontFill } from "react-icons/bs";
import { useData } from './AppContext';
import './App.css';

const NavBar = ({ isAuthenticated, name1, id1 }) => {
  const { loginState, userId } = useData();
  const navigate = useNavigate();

  const handleTrainClick = async () => {
    try {
      const res = await fetch('http://localhost:5000/booking/allTrainNames');
      const data = await res.json();

      if (res.ok && data.name && Array.isArray(data.name)) {
        // ✅ Store in localStorage
        localStorage.setItem('train_names', JSON.stringify(data.name));
        console.log('Stored train names:', data.name);
      } else {
        console.warn('Unexpected response format:', data);
      }

      // ✅ Navigate to /trains after storing
      navigate('/trains');
    } catch (error) {
      console.error('Error fetching train names:', error);
    }
  };

  return (
    <nav>
      <div className="navbar-links-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <img
          src="/siren_logo.png"
          alt="Siren Logo"
          style={{ height: '50px', marginTop: '10px', marginRight: '20px' }}
        />

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link to="/" className="primary-button">Home</Link>
          <Link to="/about" className="primary-button">About</Link>
          <Link to="/contact" className="primary-button">Contact</Link>

          {/* 🚨 Train icon now triggers backend fetch + storage + navigation */}
          <button 
            onClick={handleTrainClick} 
            className="primary-button" 
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <BsFillTrainFreightFrontFill className="navbar-train-icon" />
          </button>

          {loginState ? (
            <Link to={`/users/${userId}`} className="primary-button">User</Link>
          ) : (
            <Link to="/users/login" className="primary-button">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
