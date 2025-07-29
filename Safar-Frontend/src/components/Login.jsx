import React, { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useData } from './AppContext';
import { fetchWithAuth } from './utils';
import './login.css';

const Login = ({ setAuth }) => {
  const navigate = useNavigate();
  const { setLoginState, setUserId } = useData();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showMessage, setShowMessage] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);

  const decodeToken = (token) => {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = { username, password };

      const response = await fetchWithAuth("http://localhost:5000/user/login", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }, navigate);

      const json = await response.json();

      if (response.status === 200 && json.access_token) {
        const token = json.access_token;
        localStorage.setItem("token", token);

        const decoded = decodeToken(token);
        const userId = decoded?.user_id || decoded?.id || null;
        localStorage.setItem("userId", userId);

        setAuth(true);
        setLoginState(true);
        setUserId(userId);

        toast.success("Logged in Successfully");
        setShowMessage("Login successful");
        setModalOpen(true);
        navigate('/');
      } else {
        setAuth(false);
        toast.error("Login failed: Invalid credentials");
        setShowMessage("Login failed");
        setModalOpen(true);
      }
    } catch (err) {
      console.error("Login error:", err.message);
      toast.error("Something went wrong!");
      setShowMessage("Login error");
      setModalOpen(true);
    }
  };

  const closeMessage = () => {
    setModalOpen(false);
    setShowMessage('');
    setUsername('');
    setPassword('');
  };

  const registerUser = () => {
    navigate('/users');
  };

  return (
    <Fragment>
      <div className="main-container" style={{ 
        padding: '6rem 2rem 2rem',  // Increased top padding to push content down
        minHeight: 'calc(100vh - 80px)',  // Subtract navbar height
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="dashboard-card" style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '3rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          maxWidth: '500px',
          width: '100%',
          margin: '0 auto',
          animation: 'slideUp 0.6s ease-out'
        }}>
          <h1 className="dashboard-title" style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>Login</h1>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="username" style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#667eea',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#667eea',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
              />
            </div>

            <button type="submit" style={{
              width: '100%',
              padding: '1rem 2rem',
              border: 'none',
              borderRadius: '15px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              marginBottom: '1.5rem'
            }}>
              Login
            </button>

            <p style={{ textAlign: 'center', color: '#333' }}>
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={registerUser}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Sign Up
              </button>
            </p>
          </form>
        </div>
      </div>

      {showMessage && (
        <div className="modal" style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center'
          }}>
            <h3 style={{
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Login Status</h3>
            <p style={{ marginBottom: '2rem' }}>{showMessage}</p>
            <button 
              onClick={closeMessage}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '15px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        input:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
        }
        
        button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5) !important;
        }
        
        @media (max-width: 768px) {
          .dashboard-card {
            padding: 2rem 1rem !important;
          }
          
          .dashboard-title {
            font-size: 2rem !important;
          }
          
          .main-container {
            padding: 5rem 1rem 1rem !important;
          }
        }
      `}</style>
    </Fragment>
  );
};

export default Login;