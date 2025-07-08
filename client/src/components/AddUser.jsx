import React, { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddUser() {
  const navigate = useNavigate();

  // Only keeping required fields
  const [name, setName] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const body = { name, phone_number, username, password };
      const response = await fetch("http://localhost:5000/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (response.status === 201) {
        setMessage("Account created successfully!");
      } else {
        const data = await response.json();
        setMessage(data.error || "Something went wrong.");
      }

      setShowMessage(true);
    } catch (err) {
      console.error(err.message);
      setMessage("Network error.");
      setShowMessage(true);
    }
  };

  const closeMessage = () => {
    setShowMessage(false);
    if (message === "Account created successfully!") {
      navigate('/users/login'); // or navigate to '/' or wherever appropriate
    }
  };

  return (
    <Fragment>
      <div className='top-spacing mb-3'>
        <form onSubmit={onSubmitForm}>
          <div className="form-row">
            <div className='col-md-6 mb-2'>
              <input
                type="text"
                className='form-control'
                placeholder='Full Name'
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className='col-md-6 mb-2'>
              <input
                type="text"
                className='form-control'
                placeholder='Phone Number'
                value={phone_number}
                onChange={e => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            <div className='col-md-6 mb-2'>
              <input
                type="text"
                className='form-control'
                placeholder='Username'
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
            <div className='col-md-6 mb-2'>
              <input
                type="password"
                className='form-control'
                placeholder='Password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <button className="btn btn-primary btn-block">Register</button>
          </div>
        </form>

        <button className='btn btn-success float-right mt-3' onClick={() => navigate('/users/login')}>Back</button>
      </div>

      {showMessage && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Message</h5>
                <button type="button" className="close" onClick={closeMessage}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>{message}</p>
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
}

export default AddUser;
