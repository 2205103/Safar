import React, { useState } from 'react';
import { FiArrowRight } from "react-icons/fi";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../components/home.css';
import Popup from '../components/Popup';

const Homepage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: '' });

  const handleBookNowClick = async () => {
    try {
      const response = await fetch('http://localhost:5000/booking/getStations');
      if (!response.ok) throw new Error('Failed to fetch stations');

      const data = await response.json();
      localStorage.setItem('stationNames', JSON.stringify(data.stationNames));
      navigate('/booking/train/search');
    } catch (error) {
      console.error('Error fetching stations:', error);
      setPopup({ show: true, message: 'Unable to fetch stations. Please try again later.' });
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      // Add your subscription logic here (e.g., API call)
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <>
      <div className="homepage">
        <svg viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', zIndex: -1, top: 0, left: 0, width: '100%', height: '100%' }}>
          <defs>
            {/* Gradient definitions */}
            <radialGradient id="mainBg" cx="50%" cy="50%" r="70%">
              <stop offset="0%" style={{stopColor:'#1a1a3e', stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:'#2d1b69', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#0f0f23', stopOpacity:1}} />
            </radialGradient>
            
            <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor:'#64c8ff', stopOpacity:0}} />
              <stop offset="50%" style={{stopColor:'#64c8ff', stopOpacity:0.6}} />
              <stop offset="100%" style={{stopColor:'#64c8ff', stopOpacity:0}} />
            </linearGradient>
            
            <radialGradient id="orb1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{stopColor:'#ff64c8', stopOpacity:0.8}} />
              <stop offset="100%" style={{stopColor:'#64c8ff', stopOpacity:0.8}} />
            </radialGradient>
            
            <radialGradient id="orb2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{stopColor:'#c8ff64', stopOpacity:0.8}} />
              <stop offset="100%" style={{stopColor:'#ff64c8', stopOpacity:0.8}} />
            </radialGradient>
            
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{stopColor:'#ffffff', stopOpacity:0.8}} />
              <stop offset="70%" style={{stopColor:'#64c8ff', stopOpacity:0.3}} />
              <stop offset="100%" style={{stopColor:'#64c8ff', stopOpacity:0}} />
            </radialGradient>
            
            {/* Train gradients */}
            <linearGradient id="trainGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor:'#64c8ff', stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:'#ff64c8', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#c8ff64', stopOpacity:1}} />
            </linearGradient>
            
            <linearGradient id="trainGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor:'#ff64c8', stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:'#c8ff64', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#64c8ff', stopOpacity:1}} />
            </linearGradient>
            
            {/* Filters for effects */}
            <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8"/>
            </filter>
            
            <filter id="glow-effect" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur result="coloredBlur" stdDeviation="4"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="train-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Main background */}
          <rect width="1920" height="1080" fill="url(#mainBg)"/>
          
          {/* Animated flowing waves */}
          <path d="M0,400 Q480,350 960,400 T1920,400 L1920,1080 L0,1080 Z" fill="url(#wave1)" opacity="0.3">
            <animateTransform attributeName="transform" type="translate" values="0,0;100,20;0,0" dur="8s" repeatCount="indefinite"/>
          </path>
          
          <path d="M0,600 Q320,550 640,600 T1280,600 T1920,600 L1920,1080 L0,1080 Z" fill="url(#wave1)" opacity="0.2">
            <animateTransform attributeName="transform" type="translate" values="0,10;-50,-10;0,10" dur="12s" repeatCount="indefinite"/>
          </path>
          
          {/* Floating particles */}
          <g opacity="0.7">
            <circle cx="200" cy="300" r="3" fill="#64c8ff">
              <animateTransform attributeName="transform" type="translate" values="0,0;50,-100;0,0" dur="6s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0;1;0" dur="6s" repeatCount="indefinite"/>
            </circle>
            <circle cx="800" cy="200" r="2" fill="#ff64c8">
              <animateTransform attributeName="transform" type="translate" values="0,0;-30,80;0,0" dur="8s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0;0.8;0" dur="8s" repeatCount="indefinite"/>
            </circle>
            <circle cx="1400" cy="400" r="4" fill="#c8ff64">
              <animateTransform attributeName="transform" type="translate" values="0,0;20,-60;0,0" dur="7s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0;1;0" dur="7s" repeatCount="indefinite"/>
            </circle>
            <circle cx="600" cy="600" r="2" fill="#ffffff">
              <animateTransform attributeName="transform" type="translate" values="0,0;-40,40;0,0" dur="5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0;0.6;0" dur="5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="1200" cy="700" r="3" fill="#ff64c8">
              <animateTransform attributeName="transform" type="translate" values="0,0;60,-20;0,0" dur="9s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0;0.9;0" dur="9s" repeatCount="indefinite"/>
            </circle>
          </g>
          
          {/* Interactive orbs */}
          <circle cx="400" cy="250" r="40" fill="url(#orb1)" filter="url(#glow-effect)">
            <animateTransform attributeName="transform" type="rotate" values="0 400 250;360 400 250" dur="20s" repeatCount="indefinite"/>
            <animate attributeName="r" values="40;50;40" dur="4s" repeatCount="indefinite"/>
          </circle>
          
          <circle cx="1400" cy="300" r="35" fill="url(#orb2)" filter="url(#glow-effect)">
            <animateTransform attributeName="transform" type="rotate" values="360 1400 300;0 1400 300" dur="25s" repeatCount="indefinite"/>
            <animate attributeName="r" values="35;45;35" dur="5s" repeatCount="indefinite"/>
          </circle>
          
          <circle cx="900" cy="800" r="30" fill="url(#orb1)" filter="url(#glow-effect)">
            <animateTransform attributeName="transform" type="rotate" values="0 900 800;360 900 800" dur="15s" repeatCount="indefinite"/>
            <animate attributeName="r" values="30;40;30" dur="3s" repeatCount="indefinite"/>
          </circle>
          
          {/* Geometric shapes */}
          <g opacity="0.4">
            <rect x="150" y="500" width="30" height="30" fill="none" stroke="#64c8ff" strokeWidth="2">
              <animateTransform attributeName="transform" type="rotate" values="0 165 515;360 165 515" dur="10s" repeatCount="indefinite"/>
            </rect>
            
            <rect x="1600" y="200" width="25" height="25" fill="none" stroke="#ff64c8" strokeWidth="2">
              <animateTransform attributeName="transform" type="rotate" values="45 1612.5 212.5;405 1612.5 212.5" dur="8s" repeatCount="indefinite"/>
            </rect>
            
            <polygon points="1200,600 1230,570 1260,600 1230,630" fill="none" stroke="#c8ff64" strokeWidth="2">
              <animateTransform attributeName="transform" type="rotate" values="0 1230 600;360 1230 600" dur="12s" repeatCount="indefinite"/>
            </polygon>
            
            <circle cx="300" cy="800" r="20" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.6">
              <animate attributeName="r" values="20;30;20" dur="6s" repeatCount="indefinite"/>
            </circle>
          </g>
          
          {/* Pulse rings */}
          <g opacity="0.5">
            <circle cx="960" cy="540" r="100" fill="none" stroke="#64c8ff" strokeWidth="2">
              <animate attributeName="r" values="50;150;50" dur="4s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.8;0;0.8" dur="4s" repeatCount="indefinite"/>
            </circle>
            
            <circle cx="500" cy="400" r="80" fill="none" stroke="#ff64c8" strokeWidth="1">
              <animate attributeName="r" values="40;120;40" dur="5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.6;0;0.6" dur="5s" repeatCount="indefinite"/>
            </circle>
          </g>
          
          {/* Glowing spots */}
          <circle cx="700" cy="300" r="150" fill="url(#glow)" opacity="0.3" filter="url(#blur)">
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="6s" repeatCount="indefinite"/>
          </circle>
          
          <circle cx="1300" cy="700" r="120" fill="url(#glow)" opacity="0.2" filter="url(#blur)">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="8s" repeatCount="indefinite"/>
          </circle>
          
          {/* Connecting lines */}
          <g opacity="0.3" strokeWidth="1" fill="none">
            <path d="M400,250 Q700,200 1400,300" stroke="#64c8ff">
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur="10s" repeatCount="indefinite"/>
            </path>
            <path d="M900,800 Q600,500 400,250" stroke="#ff64c8">
              <animate attributeName="opacity" values="0.2;0.6;0.2" dur="12s" repeatCount="indefinite"/>
            </path>
          </g>
          
          {/* ANIMATED TRAINS */}
          {/* Train tracks */}
          <rect x="0" y="180" width="1920" height="4" fill="#64c8ff" opacity="0.3"/>
          <rect x="0" y="450" width="1920" height="4" fill="#ff64c8" opacity="0.3"/>
          <rect x="0" y="900" width="1920" height="4" fill="#c8ff64" opacity="0.3"/>
          
          {/* Train 1 - Moving right on top track */}
          <g filter="url(#train-glow)">
            <g>
              <animateTransform attributeName="transform" type="translate" 
                                values="-300,0; 2220,0" dur="14s" repeatCount="indefinite"/>
              
              {/* Engine */}
              <rect x="0" y="160" width="80" height="40" rx="8" fill="url(#trainGradient1)"/>
              <rect x="65" y="150" width="20" height="20" rx="4" fill="#ffffff" opacity="0.9"/>
              <circle cx="20" cy="205" r="12" fill="#333"/>
              <circle cx="60" cy="205" r="12" fill="#333"/>
              
              {/* Car 1 */}
              <rect x="90" y="165" width="70" height="35" rx="5" fill="url(#trainGradient1)" opacity="0.9"/>
              <circle cx="105" cy="205" r="10" fill="#333"/>
              <circle cx="145" cy="205" r="10" fill="#333"/>
              
              {/* Car 2 */}
              <rect x="170" y="165" width="70" height="35" rx="5" fill="url(#trainGradient1)" opacity="0.8"/>
              <circle cx="185" cy="205" r="10" fill="#333"/>
              <circle cx="225" cy="205" r="10" fill="#333"/>
            </g>
          </g>
          
          {/* Train 2 - Moving left on middle track */}
          <g filter="url(#train-glow)">
            <g>
              <animateTransform attributeName="transform" type="translate" 
                                values="2220,0; -300,0" dur="16s" repeatCount="indefinite"/>
              
              {/* Engine (facing left) */}
              <rect x="0" y="430" width="80" height="40" rx="8" fill="url(#trainGradient2)"/>
              <rect x="0" y="420" width="20" height="20" rx="4" fill="#ffffff" opacity="0.9"/>
              <circle cx="20" cy="475" r="12" fill="#333"/>
              <circle cx="60" cy="475" r="12" fill="#333"/>
              
              {/* Car 1 */}
              <rect x="90" y="435" width="70" height="35" rx="5" fill="url(#trainGradient2)" opacity="0.9"/>
              <circle cx="105" cy="475" r="10" fill="#333"/>
              <circle cx="145" cy="475" r="10" fill="#333"/>
            </g>
          </g>
          
          {/* Train 3 - Moving right on bottom track (slower, longer) */}
          <g filter="url(#train-glow)">
            <g>
              <animateTransform attributeName="transform" type="translate" 
                                values="-400,0; 2320,0" dur="22s" repeatCount="indefinite"/>
              
              {/* Engine */}
              <rect x="0" y="880" width="90" height="45" rx="10" fill="url(#trainGradient1)"/>
              <rect x="70" y="868" width="25" height="25" rx="5" fill="#ffffff" opacity="0.9"/>
              <circle cx="22" cy="930" r="14" fill="#333"/>
              <circle cx="68" cy="930" r="14" fill="#333"/>
              
              {/* Car 1 */}
              <rect x="100" y="885" width="75" height="40" rx="6" fill="url(#trainGradient1)" opacity="0.9"/>
              <circle cx="117" cy="930" r="12" fill="#333"/>
              <circle cx="158" cy="930" r="12" fill="#333"/>
              
              {/* Car 2 */}
              <rect x="185" y="885" width="75" height="40" rx="6" fill="url(#trainGradient1)" opacity="0.8"/>
              <circle cx="202" cy="930" r="12" fill="#333"/>
              <circle cx="243" cy="930" r="12" fill="#333"/>
              
              {/* Car 3 */}
              <rect x="270" y="885" width="75" height="40" rx="6" fill="url(#trainGradient1)" opacity="0.7"/>
              <circle cx="287" cy="930" r="12" fill="#333"/>
              <circle cx="328" cy="930" r="12" fill="#333"/>
            </g>
          </g>
          
          {/* Train smoke effects */}
          <g opacity="0.4">
            <circle cx="0" cy="145" r="12" fill="#64c8ff">
              <animateTransform attributeName="transform" type="translate" 
                                values="-300,0; 2220,0" dur="14s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite"/>
              <animate attributeName="r" values="12;20;12" dur="3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="0" cy="415" r="10" fill="#ff64c8">
              <animateTransform attributeName="transform" type="translate" 
                                values="2220,0; -300,0" dur="16s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite"/>
              <animate attributeName="r" values="10;18;10" dur="2.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="0" cy="865" r="15" fill="#c8ff64">
              <animateTransform attributeName="transform" type="translate" 
                                values="-400,0; 2320,0" dur="22s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.4;0;0.4" dur="4s" repeatCount="indefinite"/>
              <animate attributeName="r" values="15;25;15" dur="4s" repeatCount="indefinite"/>
            </circle>
          </g>
          
          {/* Additional atmospheric effects */}
          <rect x="0" y="0" width="1920" height="1080" fill="url(#mainBg)" opacity="0.1"/>
        </svg>
        <div className="homepage-content">
          <h1 className="primary-heading">Safar Khoobsurat hain manzil se bhi!</h1>
          <p className="primary-text">
            Let us help you find the best train tickets for your next trip. At the cheapest you can find!
          </p>
          <button className="secondary-button" onClick={handleBookNowClick}>
            Book Now <FiArrowRight />
          </button>
        </div>
      </div>

      {/* Hardcoded Footer Section */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>🚂 Safar</h3>
              <p>Making train travel beautiful and accessible for everyone. Book your perfect journey with us and experience comfort like never before.</p>
              <div className="social-links">
                <a href="https://facebook.com" className="icon-facebook" title="Facebook" target="_blank" rel="noopener noreferrer">
                  <FaFacebookF />
                </a>
                <a href="https://twitter.com" className="icon-twitter" title="Twitter" target="_blank" rel="noopener noreferrer">
                  <FaTwitter />
                </a>
                <a href="https://instagram.com" className="icon-instagram" title="Instagram" target="_blank" rel="noopener noreferrer">
                  <FaInstagram />
                </a>
                <a href="https://linkedin.com" className="icon-linkedin" title="LinkedIn" target="_blank" rel="noopener noreferrer">
                  <FaLinkedinIn />
                </a>
              </div>
            </div>

            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul className="footer-links">
                <li><a href="#">Book Tickets</a></li>
                <li><a href="#">Train Schedules</a></li>
                <li><a href="#">Route Map</a></li>
                <li><a href="#">Seat Availability</a></li>
                <li><a href="#">Travel Insurance</a></li>
                <li><a href="#">Group Bookings</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Our Services</h3>
              <ul className="footer-links">
                <li><a href="#">Premium Coaches</a></li>
                <li><a href="#">Meal Services</a></li>
                <li><a href="#">Wi-Fi Enabled</a></li>
                <li><a href="#">Luggage Assistance</a></li>
                <li><a href="#">Customer Support</a></li>
                <li><a href="#">Mobile App</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Stay Connected</h3>
              <div className="contact-info">
                <span className="icon-phone">📞</span>
                <span>+880-1234-567890</span>
              </div>
              <div className="contact-info">
                <span className="icon-email">✉️</span>
                <span>support@safar.com</span>
              </div>
              <div className="contact-info">
                <span className="icon-location">🌍</span>
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>

            <div className="newsletter">
              <h4>Newsletter</h4>
              <p>Get travel tips and exclusive offers!</p>
              <form className="newsletter-form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit">Subscribe</button>
              </form>
              {subscribed && <p className="success-message">Subscribed successfully!</p>}
            </div>
          </div>

          <div className="footer-bottom">
            <div>
              <p>&copy; 2024 Safar. All rights reserved. | Made with ❤️ in Bangladesh</p>
            </div>
            <ul className="footer-bottom-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
              <li><a href="#">Refund Policy</a></li>
            </ul>
            <div className="payment-methods">
              <span style={{ marginRight: "10px", fontSize: "14px" }}>We Accept:</span>
              <div className="payment-icon">VISA</div>
              <div className="payment-icon">MC</div>
              <div className="payment-icon">bKash</div>
              <div className="payment-icon">Nagad</div>
            </div>
          </div>
        </div>
      </footer>

      {/* Footer CSS */}
      <style jsx>{`
        .footer {
          background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
          color: white;
          padding: 60px 0 60px;
          position: relative;
          overflow: hidden;
        }

        .footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.05)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.07)"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grain)"/></svg>');
          opacity: 0.3;
        }

        .footer-container {
          max-width: 1200px;
          margin: auto;
          padding: 100 10px;
          position: relative;
          z-index: 1;
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
          margin-bottom: 40px;
        }

        .footer-section h3 {
          font-size: 20px;
          margin-bottom: 20px;
          position: relative;
          padding-bottom: 10px;
        }

        .footer-section h3::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
          border-radius: 2px;
        }

        .footer-section p {
          line-height: 1.6;
          margin-bottom: 15px;
          opacity: 0.9;
        }

        .footer-links {
          list-style: none;
        }

        .footer-links li {
          margin-bottom: 10px;
        }

        .footer-links a {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
        }

        .footer-links a:hover {
          color: #4ecdc4;
          padding-left: 5px;
        }

        .contact-info {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }

        .contact-info i {
          margin-right: 10px;
          width: 20px;
          font-size: 16px;
          color: #4ecdc4;
        }

        .social-links {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }

        .social-links a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          color: white;
          text-decoration: none;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .social-links a:hover {
          background: #4ecdc4;
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(78, 205, 196, 0.4);
        }

        .newsletter {
          background: rgba(216, 7, 7, 0.1);
          padding: 5px;
          border-radius: 10px;
          backdrop-filter: blur(0px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .newsletter-form {
          display: flex;
          margin-top: 15px;
          gap:30px;
        }

        .newsletter-form input {
          flex: 1;
          padding: 12px 30px;
          border: none;
          border-radius: 25px;
          background: rgba(255, 255, 255, 0.9);
          color: #333;
          outline: none;
        }

        .newsletter-form button {
          padding: 12px 30px;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
          border: none;
          border-radius: 25px;
          color: white;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .newsletter-form button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .footer-bottom-links {
          display: flex;
          gap: 20px;
          list-style: none;
        }

        .footer-bottom-links a {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s ease;
        }

        .footer-bottom-links a:hover {
          color: #4ecdc4;
        }

        .payment-methods {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .payment-icon {
          width: 40px;
          height: 25px;
          background: white;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          color: #333;
        }

        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .footer-bottom {
            flex-direction: column;
            text-align: center;
          }

          .newsletter-form {
            flex-direction: column;
          }
        }
      `}</style>
      {popup.show && <Popup message={popup.message} onClose={() => setPopup({ show: false, message: '' })} />}
    </>
  );
}

export default Homepage;