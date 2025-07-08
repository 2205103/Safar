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
  const { loginState, userId, setUserId, token, setToken, name, setName, setLoginState } = useData();
  const { id } = useParams();

  const [userData, setUserData] = useState(null);

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
        if (id === "") return;
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
      }
    };

    fetchUserData();
  }, [id, loginState, userId, navigate]);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setErrMessage('');
    setSuccessMessage('');
    setPassword('');
    setNewPassword('');
  }

  const closeErrorModal = () => {
    setErrorModalIsOpen(false);
  };

  function showTicket() {
    navigate(`/users/${id}/tickets`);
  }

  const UpdateInformation = async (e) => {
    e.preventDefault();
    try {
      if (!password) {
        setErrMessage("Please enter your current password to confirm the changes.");
        setErrorModalIsOpen(true);
        return;
      }
      const body = { password, new_password };
      const res = await fetch(`http://localhost:5000/user/info/update/${userData.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 200) {
        setSuccessMessage("Password updated successfully!");
        setPassword('');
        setNewPassword('');
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else if (res.status === 400) {
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
        setErrMessage("Please enter your password to delete the account.");
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
        // Log out after account deletion
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('name');
        setName('');
        setUserId('');
        setLoginState(false);
        navigate('/');
      } else {
        const errorMessage = await response.json();
        setErrMessage(errorMessage.error);
        setErrorModalIsOpen(true);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <Fragment>
      <div className="container mt-5">
        {userData && (
          <div className="card">
            <div className="card-header">
              <h2>User Dashboard</h2>
            </div>
            <div className="card-body">
              <div className="user-information">
                <p><strong>First Name:</strong> {userData.first_name}</p>
                <p><strong>Last Name:</strong> {userData.last_name}</p>
                <p><strong>Phone Number:</strong> {userData.phone_number}</p>
              </div>
            </div>
            <div className="card-footer">
              <button onClick={openModal} className="btn btn-warning">Edit</button>
              <span style={{ padding: '20px' }}></span>
              <button onClick={showTicket} className="btn btn-warning">Ticket History</button>
              <button onClick={logOut} className="btn btn-danger" style={{ float: 'right' }}>Log Out</button>
              <button onClick={() => setDelModal(true)} className="btn btn-danger" style={{ float: 'right' }}>Delete</button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Edit Password Modal"
      >
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
            <div className="alert alert-success text-center" role="alert">
              {successMessage}
            </div>
          )}

          <div className="modal-footer">
            <button type="submit" className="btn btn-warning">Confirm</button>
            <button type="button" onClick={resetInfo} className="btn btn-danger">Reset</button>
          </div>
        </form>

        <ErrorModal
          isOpen={errorModalIsOpen}
          errorMessage={errMessage}
          closeModal={closeErrorModal}
        />
      </Modal>

      <Modal
        isOpen={delModal}
        onRequestClose={() => setDelModal(false)}
        style={customStyles}
        contentLabel="Delete User Modal"
      >
        <div className="modal-header">
          <h2>Delete Account</h2>
          <button onClick={() => setDelModal(false)} className="close">&times;</button>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete your account?</p>
          <p>If you delete your account your ticket will be cancelled</p>
          <p>But you will not get refund</p>
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
        <ErrorModal
          isOpen={errorModalIsOpen}
          errorMessage={errMessage}
          closeModal={closeErrorModal}
        />
      </Modal>
    </Fragment>
  );
};

export default ShowUser;
