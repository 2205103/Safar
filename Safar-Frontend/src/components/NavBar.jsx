import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsFillTrainFreightFrontFill } from "react-icons/bs";
import { useData } from './AppContext';
import { fetchWithAuth } from './utils';

const NavBar = () => {
  const { loginState, userId } = useData();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuActive, setMobileMenuActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTrainClick = async () => {
    try {
      const res = await fetchWithAuth('http://localhost:5000/booking/allTrainNames', {}, navigate);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();

      if (data.name && Array.isArray(data.name)) {
        localStorage.setItem('train_names', JSON.stringify(data.name));
        console.log('Stored train names:', data.name);
        navigate('/trains');
      } else {
        console.error('Invalid data format received');
        // Fallback in case of invalid data
        navigate('/trains');
      }
    } catch (error) {
      console.error('Error fetching train names:', error);
      // Navigate even if there's an error (fallback)
      navigate('/trains');
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuActive(!mobileMenuActive);
  };

  const closeMobileMenu = () => {
    setMobileMenuActive(false);
  };

  // Styles
  const navbarStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: '1rem 0rem 1rem 0rem',
    backdropFilter: 'blur(20px)',
    background: 'rgba(255, 255, 255, 0.1)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease',
    ...(scrolled && {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(25px)'
    })
  };

  const navContainerStyles = {
    fontSize: '2rem',
    fontWeight: 100,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '0 2rem' // Add padding here instead of on the main nav
  };

  const logoStyles = {
    fontFamily: "'Cairo', 'Amiri', sans-serif",
    fontSize: '3.5rem',
    fontWeight: 700,
    letterSpacing: '2px',
    color: 'white',
    textDecoration: 'none',
    transition: 'transform 0.3s ease',
    ':hover': {
      transform: 'scale(1.05)'
    }
  };

  const navMenuStyles = {
    display: 'flex',
    listStyle: 'none',
    gap: '1rem',
    alignItems: 'center',
    direction: 'ltr',
    margin: 0,
    padding: 10,
    ...(mobileMenuActive && {
      position: 'fixed',
      top: '80px',
      left: 0,
      right: 0,
      background: 'rgba(102, 126, 234, 0.95)',
      backdropFilter: 'blur(20px)',
      flexDirection: 'column',
      padding: '2rem',
      transform: 'translateY(0)',
      opacity: 1,
      visibility: 'visible',
      gap: '1rem'
    }),
    ...(!mobileMenuActive && window.innerWidth <= 768 && {
      position: 'fixed',
      top: '80px',
      left: 0,
      right: 0,
      transform: 'translateY(-150%)',
      opacity: 0,
      visibility: 'hidden',
      transition: 'all 0.3s ease'
    })
  };

  const navLinkStyles = {
    color: 'rgba(255, 255, 255, 0.9)',
    textDecoration: 'none',
    fontWeight: 500,
    padding: '0.5rem 1rem',
    borderRadius: '25px',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    ':hover': {
      background: 'rgba(255, 255, 255, 0.15)',
      color: 'white',
      transform: 'translateY(-2px)'
    }
  };

  const ctaButtonStyles = {
    ...navLinkStyles,
    background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
    color: 'white !important',
    padding: '0.75rem 1.5rem !important',
    borderRadius: '25px !important',
    fontWeight: '600 !important',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
    ':hover': {
      transform: 'translateY(-3px) !important',
      boxShadow: '0 6px 20px rgba(255, 107, 107, 0.6) !important',
      background: 'linear-gradient(45deg, #feca57, #ff6b6b) !important'
    }
  };

  const mobileMenuToggleStyles = {
    display: 'none',
    flexDirection: 'column',
    cursor: 'pointer',
    padding: '0.5rem',
    ...(mobileMenuActive && {
      '.hamburger:nth-child(1)': {
        transform: 'rotate(-45deg) translate(-5px, 6px)'
      },
      '.hamburger:nth-child(2)': {
        opacity: 0
      },
      '.hamburger:nth-child(3)': {
        transform: 'rotate(45deg) translate(-5px, -6px)'
      }
    }),
    '@media (max-width: 768px)': {
      display: 'flex'
    }
  };

  const hamburgerStyles = {
    width: '25px',
    height: '3px',
    background: 'white',
    margin: '3px 0',
    transition: '0.3s',
    borderRadius: '2px'
  };

  return (
    <nav style={navbarStyles}>
      <div style={navContainerStyles}>
        <Link to="/" style={logoStyles} onClick={closeMobileMenu}>
          سفر
        </Link>

        <ul style={navMenuStyles}>
          <li>
            <Link to="/" style={navLinkStyles} onClick={closeMobileMenu}>Home</Link>
          </li>
          <li>
            <Link to="/about" style={navLinkStyles} onClick={closeMobileMenu}>About</Link>
          </li>
          <li>
            <button
              onClick={(e) => {
                e.preventDefault(); // Prevent default behavior
                handleTrainClick().then(() => {
                  closeMobileMenu();
                });
              }}
              style={navLinkStyles}
            >
              <BsFillTrainFreightFrontFill style={{ marginRight: '0.5rem' }} />
              Trains
            </button>
          </li>

          {loginState ? (
            <li>
              <Link to={`/users/${userId}`} style={navLinkStyles} onClick={closeMobileMenu}>My Account</Link>
            </li>
          ) : (
            <li>
              <Link to="/users/login" style={ctaButtonStyles} onClick={closeMobileMenu}>Login</Link>
            </li>
          )}
        </ul>

        <div
          style={mobileMenuToggleStyles}
          onClick={toggleMobileMenu}
        >
          <div style={hamburgerStyles}></div>
          <div style={hamburgerStyles}></div>
          <div style={hamburgerStyles}></div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;