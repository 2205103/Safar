import React, { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from './AppContext';
import Modal from 'react-modal';
import ErrorModal from './ErrorModal';
import './showuserpg.css';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const ShowUser = () => {
  const navigate = useNavigate();
  const { loginState, userId, setUserId, name, setName, setLoginState } = useData();
  const { id } = useParams();

  const [userData, setUserData] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [error, setError] = useState('');
  const [showTickets, setShowTickets] = useState(false);

  const [password, setPassword] = useState('');
  const [new_password, setNewPassword] = useState('');

  const [modalIsOpen, setIsOpen] = useState(false);
  const [errMessage, setErrMessage] = useState('');
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [deletePassword, setDeletePassword] = useState('');
  const [delModal, setDelModal] = useState(false);

  useEffect(() => {
    if (!loginState || userId === null || userId.toString() !== id) {
      navigate(`/`);
      return;
    }

    const fetchUserData = async () => {
      try {
        if (id === '') return;
        setLoadingUser(true);
        const response = await fetch(`http://localhost:5000/user/info/${id}`);
        const rec = await response.json();

        if (rec.data && rec.data.result) {
          setUserData(rec.data.result);
        } else {
          setUserData({
            first_name: 'NULL',
            last_name: 'NULL',
            phone_number: 'NULL',
          });
        }
      } catch (error) {
        console.error(error.message);
        setUserData({
          first_name: 'NULL',
          last_name: 'NULL',
          phone_number: 'NULL',
        });
      } finally {
        setLoadingUser(false);
      }
    };

    const fetchTickets = async () => {
      try {
        setLoadingTickets(true);
        const res = await fetch(`http://localhost:5000/user/printTicket/${id}`);
        const json = await res.json();

        if (json.success) {
          setTicketData(json.data);
          setError('');
        } else {
          setTicketData(null);
          setError(json.error || 'No ticket history found');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch ticket history.');
      } finally {
        setLoadingTickets(false);
      }
    };

    fetchUserData();
    fetchTickets();
  }, [id, loginState, userId, navigate]);

  const groupedByDate = () => {
    if (!ticketData || !ticketData.seat_reservations) return {};
    return ticketData.seat_reservations.reduce((acc, seat) => {
      const date = seat.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(seat);
      return acc;
    }, {});
  };

  const groupedSeats = groupedByDate();

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setErrMessage('');
    setSuccessMessage('');
    setPassword('');
    setNewPassword('');
  };

  const closeErrorModal = () => setErrorModalIsOpen(false);

  const UpdateInformation = async (e) => {
    e.preventDefault();
    try {
      if (!password) {
        setErrMessage('Please enter your current password to confirm the changes.');
        setErrorModalIsOpen(true);
        return;
      }
      const body = { password, new_password };
      const res = await fetch(`http://localhost:5000/user/info/update/${userData.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.status === 200) {
        setSuccessMessage('Password updated successfully!');
        setTimeout(closeModal, 2000);
      } else {
        const errorMessage = await res.json();
        setErrMessage(errorMessage.error);
        setErrorModalIsOpen(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const resetInfo = () => {
    setPassword('');
    setNewPassword('');
  };

  const logOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    setName('');
    setUserId('');
    setLoginState(false);
    navigate('/');
  };

  const handleDeleteConfirmation = async () => {
    try {
      if (!deletePassword) {
        setErrMessage('Please enter your password to delete the account.');
        setErrorModalIsOpen(true);
        return;
      }

      const body = { password: deletePassword };
      const response = await fetch(`http://localhost:5000/user/info/delete/${userData.user_id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.status === 200) {
        logOut();
      } else {
        const errorMessage = await response.json();
        setErrMessage(errorMessage.error);
        setErrorModalIsOpen(true);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  // Updated function to cancel ticket by ticket_id
  const handleCancelTicketForDate = async (ticketId) => {
    if (!window.confirm(`Are you sure you want to cancel this ticket?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/booking/cancelTicket', {
        method: 'POST', // or 'DELETE' if your API uses that
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ticket_id: ticketId }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Cancellation failed');
      }

      alert('Ticket canceled successfully.');

      // Refresh tickets after cancellation
      setLoadingTickets(true);
      const res = await fetch(`http://localhost:5000/user/printTicket/${id}`);
      const json = await res.json();
      if (json.success) {
        setTicketData(json.data);
        setError('');
      } else {
        setTicketData(null);
        setError(json.error || 'No ticket history found');
      }
      setLoadingTickets(false);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <Fragment>
      <div className="container mt-5">
        {(loadingUser || loadingTickets) && <p>Loading...</p>}
        {!loadingUser && userData && (
          <div className="card mb-4">
            <div className="card-header">
              <h2>User Dashboard</h2>
            </div>
            <div className="card-body">
              <p><strong>First Name:</strong> {userData.first_name}</p>
              <p><strong>Last Name:</strong> {userData.last_name}</p>
              <p><strong>Phone Number:</strong> {userData.phone_number}</p>
            </div>
            <div className="card-footer">
              <button onClick={openModal} className="btn btn-warning">Edit Password</button>
              <button
                onClick={() => setShowTickets(prev => !prev)}
                className="btn btn-info"
                style={{ marginLeft: '10px' }}
              >
                {showTickets ? 'Hide Ticket History' : 'Show Ticket History'}
              </button>
              <button onClick={logOut} className="btn btn-danger" style={{ float: 'right' }}>Log Out</button>
              <button onClick={() => setDelModal(true)} className="btn btn-danger" style={{ float: 'right', marginRight: '10px' }}>Delete Account</button>
            </div>
          </div>
        )}

        {showTickets && !loadingTickets && ticketData && (
          <div>
            <h3>Ticket History</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {(!ticketData.seat_reservations || ticketData.seat_reservations.length === 0) && (
              <p>No tickets booked yet.</p>
            )}
            {Object.keys(groupedSeats).map((date) => (
              <div
                key={date}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '20px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  position: 'relative',
                }}
              >
                <h5>
                  Journey Date: {new Date(date).toLocaleDateString()}
                  <button
                    style={{
                      marginLeft: '20px',
                      padding: '5px 10px',
                      backgroundColor: 'red',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      float: 'right',
                      position: 'absolute',
                      right: '15px',
                      top: '15px',
                    }}
                    onClick={() => {
                      const ticketId = groupedSeats[date][0]?.ticket_id;
                      if (!ticketId) {
                        alert("Ticket ID not found for this date.");
                        return;
                      }
                      handleCancelTicketForDate(ticketId);
                    }}
                  >
                    Cancel Ticket
                  </button>
                </h5>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Seat Number</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Class</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Train</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>From</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedSeats[date].map((seat, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px' }}>{seat.seat_number}</td>
                        <td style={{ padding: '8px' }}>{seat.class_code}</td>
                        <td style={{ padding: '8px' }}>{seat.train_code}</td>
                        <td style={{ padding: '8px' }}>{seat.from_station}</td>
                        <td style={{ padding: '8px' }}>{seat.to_station}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Password Modal */}
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles}>
        <div className="modal-header">
          <h2>Update your password</h2>
          <button onClick={closeModal} className="close">&times;</button>
        </div>
        <form onSubmit={UpdateInformation}>
          <div className="modal-body">
            <input
              type="password"
              className="form-control mb-2"
              placeholder="Enter new password"
              value={new_password || ''}
              onChange={e => setNewPassword(e.target.value)}
            />
            <h5>Confirm with old password</h5>
            <input
              type="password"
              className="form-control mb-2"
              placeholder="Enter your current password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          {successMessage && (
            <div className="alert alert-success text-center">{successMessage}</div>
          )}
          <div className="modal-footer">
            <button type="submit" className="btn btn-warning">Confirm</button>
            <button type="button" onClick={resetInfo} className="btn btn-danger">Reset</button>
          </div>
        </form>
        <ErrorModal isOpen={errorModalIsOpen} errorMessage={errMessage} closeModal={closeErrorModal} />
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={delModal} onRequestClose={() => setDelModal(false)} style={customStyles}>
        <div className="modal-header">
          <h2>Delete Account</h2>
          <button onClick={() => setDelModal(false)} className="close">&times;</button>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete your account?</p>
          <p>If you delete your account, your tickets will be canceled but no refund will be issued.</p>
          <input
            type="password"
            className="form-control mb-2"
            placeholder="Enter your password to confirm deletion"
            value={deletePassword}
            onChange={e => setDeletePassword(e.target.value)}
          />
        </div>
        <div className="modal-footer">
          <button onClick={handleDeleteConfirmation} className="btn btn-danger">Confirm Delete</button>
          <button onClick={() => setDelModal(false)} className="btn btn-secondary">Cancel</button>
        </div>
        <ErrorModal isOpen={errorModalIsOpen} errorMessage={errMessage} closeModal={closeErrorModal} />
      </Modal>
    </Fragment>
  );
};

export default ShowUser;
