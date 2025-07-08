import React, { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useData } from './AppContext';
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

      const response = await fetch("http://localhost:5000/user/login", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

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
      <div className="login-form-container" style={{ marginTop: '100px' }}>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">Login</button>
          <p className="signup-message">
            Don't have an account? <button type="button" className="btn btn-secondary" onClick={registerUser}>Sign Up</button>
          </p>
        </form>
      </div>

      {showMessage && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Login Status</h5>
                <button type="button" className="close" onClick={closeMessage}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>{showMessage}</p>
                <button type="button" className="btn btn-primary" onClick={closeMessage}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default Login;
