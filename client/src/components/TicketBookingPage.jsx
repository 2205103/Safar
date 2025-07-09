import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '320px',
    padding: '20px',
  },
};

const TicketBookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const ticketId = location.state?.ticketId;

  const [ticketData, setTicketData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState('');

  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!ticketId) {
        setError('No ticket ID provided');
        return;
      }

      setLoading(true);
      setError('');
      setTicketData(null);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/booking/getTicket', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ ticket_id: ticketId }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch ticket data');
        }

        const data = await response.json();
        setTicketData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [ticketId]);

  useEffect(() => {
    if (!ticketData || modalIsOpen) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [ticketData, modalIsOpen]);

  useEffect(() => {
    if (timeLeft <= 0) {
      clearInterval(timerRef.current);
      autoCancelTicket();
    }
  }, [timeLeft]);

  const autoCancelTicket = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/booking/cancelTicket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ticket_id: ticketId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Auto cancellation failed');
      }

      alert('Time expired! Ticket was automatically canceled.');
      navigate('/');
    } catch (err) {
      alert(`Error auto-canceling ticket: ${err.message}`);
      navigate('/');
    }
  };

  const openModal = () => {
    if (!paymentMethod) {
      alert('Please select a payment method first.');
      return;
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleConfirmPayment = () => {
    if (!transactionId.trim()) {
      alert('Please enter your transaction ID.');
      return;
    }

    clearInterval(timerRef.current);

    alert(`Payment confirmed!\nPayment method: ${paymentMethod}\nTransaction ID: ${transactionId}`);
    closeModal();
    navigate('/'); // 🔥 Redirect after confirmation
  };

  const handleCancelTicket = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/booking/cancelTicket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ticket_id: ticketId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Cancellation failed');
      }

      setCancelSuccess('Ticket canceled successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <p>Loading ticket details...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!ticketData) return null;

  const journeyDateOnly = ticketData.Journey_date;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTimer = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  return (
    <div style={{ padding: 20 }}>
      <h2>Ticket Details & Payment</h2>

      <div style={{ marginBottom: 20 }}>
        <h3>
          Train: {ticketData.train_name} (Code: {ticketData.train_code})
        </h3>
        <p>From: {ticketData.From} | To: {ticketData.To}</p>
        <p>Journey Date: {journeyDateOnly}</p>
        <h4>Seats Booked:</h4>
        {ticketData.Seat_details.map((cls, idx) => (
          <div key={idx}>
            <strong>{cls.class_code}:</strong> {cls.seats.join(', ')}
          </div>
        ))}
        <p>Total Cost: {ticketData.total_cost} tk</p>
      </div>

      <p style={{ fontWeight: 'bold', fontSize: '18px', color: timeLeft <= 30 ? 'red' : 'black' }}>
        Time left to confirm payment: {formattedTimer}
      </p>

      <div>
        <h3>Select Payment Method</h3>
        <div style={{ display: 'flex', gap: '30px' }}>
          <div
            onClick={() => setPaymentMethod('bkash')}
            style={{
              border: paymentMethod === 'bkash' ? '3px solid green' : '1px solid gray',
              padding: '10px',
              cursor: 'pointer',
              width: '130px',
              height: '140px',
              userSelect: 'none',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <img src="../bkash4.png" alt="Bkash" style={{ width: '60%', height: 'auto' }} />
            <span style={{ fontWeight: 'bold', color: '#e5383b', fontSize: '18px' }}>Bkash</span>
          </div>

          <div
            onClick={() => setPaymentMethod('nagad')}
            style={{
              border: paymentMethod === 'nagad' ? '3px solid green' : '1px solid gray',
              padding: '10px',
              cursor: 'pointer',
              width: '130px',
              height: '140px',
              userSelect: 'none',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <img src="../nagad.png" alt="Nagad" style={{ width: '60%', height: 'auto' }} />
            <span style={{ fontWeight: 'bold', color: '#1c47a9', fontSize: '18px' }}>Nagad</span>
          </div>
        </div>

        <button
          onClick={openModal}
          style={{ marginTop: 20, padding: '10px 20px', fontSize: '16px' }}
        >
          Confirm Payment
        </button>

        <button
          onClick={() => setCancelModalOpen(true)}
          style={{
            marginTop: 20,
            marginLeft: 20,
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: 'red',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Cancel Ticket
        </button>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Transaction ID Modal"
        ariaHideApp={false}
      >
        <div style={{ marginBottom: 10 }}>
          <h4>Add Transaction ID</h4>
          <button
            onClick={closeModal}
            style={{ float: 'right', fontSize: 20, background: 'none', border: 'none', cursor: 'pointer' }}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <input
          type="text"
          placeholder="Enter Transaction ID"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button
          onClick={handleConfirmPayment}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Confirm
        </button>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onRequestClose={() => setCancelModalOpen(false)}
        style={customStyles}
        contentLabel="Cancel Ticket Modal"
        ariaHideApp={false}
      >
        <h4>Are you sure you want to cancel this ticket?</h4>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={handleCancelTicket}
            style={{ padding: '10px 20px', backgroundColor: 'red', color: 'white', border: 'none' }}
          >
            Yes, Cancel
          </button>
          <button
            onClick={() => setCancelModalOpen(false)}
            style={{ padding: '10px 20px' }}
          >
            No
          </button>
        </div>
        {cancelSuccess && (
          <p style={{ marginTop: '15px', color: 'green', fontWeight: 'bold' }}>{cancelSuccess}</p>
        )}
      </Modal>
    </div>
  );
};

export default TicketBookingPage;
