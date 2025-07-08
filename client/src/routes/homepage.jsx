import React from 'react'
import UserList from '../components/UserList'
import Header from '../components/Header'
import HomePage from '../components/HomePage'
import About from '../components/About'
import '../components/App.css'
import { FiArrowRight } from "react-icons/fi";
import { Link, Navigate } from 'react-router-dom';





const homepage = () => {

  // reloadPage();
 
  return (
    <div>

      <HomePage />

      <div className="home-banner-container">
        <div className="home-bannerImage-container">
          <img src={'home-banner-background.png'} alt="" />
        </div>
        <div className="home-text-section" style={{marginTop:'20px'}}>
          <h1 className="primary-heading">
            Ticket Booking was never Easier!
          </h1>
          <p className="primary-text">
            Let us help you find the best train tickets for your next trip. At the cheapest you can find!
          </p>
          <button className="secondary-button">

            <Link to={`/booking/train/search`} style={{ textDecoration: 'none', color: 'inherit' }}>
              Book Now <FiArrowRight />{" "}
            </Link>
          </button>
        </div>
        <div className="home-image-section"><span style={{ marginLeft: '50px', padding: '5px' }}></span>
          <img src={'train2.png'} alt="" />
        </div>
        
      </div>
      <div className="home-image-section"><span style={{ marginLeft: '50px' }}></span>
          <img src={'tickets.png'} alt="" />
        </div>
      <div><About/></div>
    </div>
    
   
  )
}

export default homepage