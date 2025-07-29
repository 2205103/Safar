import React, { useState } from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import './footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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
  );
};

export default Footer;
