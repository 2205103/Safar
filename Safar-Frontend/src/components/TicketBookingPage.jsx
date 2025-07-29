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
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    border: 'none'
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

  const [timeLeft, setTimeLeft] = useState(3 * 60); // 30 minutes in seconds
  const timerRef = useRef(null);

  // Fetch ticket details
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

  // Timer countdown
  useEffect(() => {
    if (!ticketData || modalIsOpen) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [ticketData, modalIsOpen]);

  // Auto cancel when time expires
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
      alert('Please enter Amount');
      return;
    }
    else if (transactionId.trim() !== ticketData.total_cost.toString()) {
      alert(`Amount must match the total cost of ${ticketData.total_cost} tk.`);
      return;
    }

    clearInterval(timerRef.current);

    alert(`Payment confirmed!\nPayment method: ${paymentMethod}\nTransaction Amount: ${transactionId}`);
    closeModal();
    navigate('/');
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

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #0d9488 100%)'
    }}>
      <div style={{
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: '600'
      }}>Loading ticket details...</div>
    </div>
  );
  
  if (error) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #0d9488 100%)'
    }}>
      <div style={{
        color: '#ef4444',
        fontSize: '1.2rem',
        fontWeight: '500',
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
      }}>{error}</div>
    </div>
  );
  
  if (!ticketData) return null;

  const journeyDateOnly = new Date(ticketData.Journey_date).toLocaleDateString();
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const formattedTimer = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #0d9488 100%)',
      padding: '2rem',
      paddingTop: '80px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        animation: 'fadeInUp 0.8s ease-out'
      }}>
        {/* Header Section */}
        <div style={{
          background: 'linear-gradient(45deg, #10b981, #0d9488)',
          padding: '2rem',
          textAlign: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%)',
            animation: 'rotate 20s linear infinite'
          }}></div>
          <h2 style={{ 
            color: '#ffffff', 
            fontSize: '2rem',
            marginBottom: '0.5rem',
            position: 'relative',
            zIndex: 1,
            letterSpacing: '1px'
          }}>Ticket Details & Payment</h2>
          <p style={{
            position: 'relative',
            zIndex: 1,
            opacity: 0.9,
            fontSize: '1.1rem'
          }}>Complete your booking by making the payment</p>
        </div>

        <div style={{
          padding: '3rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}>
          {/* Ticket Details */}
          <div style={{
            background: 'linear-gradient(120deg, rgba(16, 185, 129, 0.1), rgba(13, 148, 136, 0.1))',
            padding: '2rem',
            borderRadius: '16px',
            borderLeft: '4px solid #10b981'
          }}>
            <h3 style={{
              color: '#047857',
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              position: 'relative',
              paddingBottom: '0.5rem'
            }}>
              Journey Information
              <span style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '50px',
                height: '3px',
                background: 'linear-gradient(45deg, #10b981, #0d9488)',
                borderRadius: '2px'
              }}></span>
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              <div>
                <p style={{ color: '#047857', fontWeight: '600', marginBottom: '0.5rem' }}>Train:</p>
                <p style={{ fontSize: '1.1rem' }}>
                  {ticketData.train_name} <span style={{ color: '#6b7280' }}>({ticketData.train_code})</span>
                </p>
              </div>
              
              <div>
                <p style={{ color: '#047857', fontWeight: '600', marginBottom: '0.5rem' }}>Route:</p>
                <p style={{ fontSize: '1.1rem' }}>
                  {ticketData.From} → {ticketData.To}
                </p>
              </div>
              
              <div>
                <p style={{ color: '#047857', fontWeight: '600', marginBottom: '0.5rem' }}>Journey Date:</p>
                <p style={{ fontSize: '1.1rem' }}>{journeyDateOnly}</p>
              </div>
              
              <div>
                <p style={{ color: '#047857', fontWeight: '600', marginBottom: '0.5rem' }}>Total Cost:</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#065f46' }}>
                  {ticketData.total_cost} tk
                </p>
              </div>
            </div>
            
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ color: '#047857', fontWeight: '600', marginBottom: '1rem' }}>Seats Booked:</h4>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                {ticketData.Seat_details.map((cls, idx) => (
                  <div key={idx} style={{
                    background: '#ecfdf5',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                  }}>
                    <strong style={{ color: '#065f46' }}>{cls.class_code}:</strong> {cls.seats.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timer */}
          <div style={{
            background: timeLeft <= 600 ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
            border: timeLeft <= 600 ? '2px solid #ef4444' : '2px solid #10b981'
          }}>
            <p style={{
              fontWeight: 'bold',
              fontSize: '1.2rem',
              color: timeLeft <= 600 ? '#b91c1c' : '#065f46',
              marginBottom: '0.5rem'
            }}>
              Time left to confirm payment:
            </p>
            <p style={{
              fontWeight: 'bold',
              fontSize: '2rem',
              color: timeLeft <= 600 ? '#dc2626' : '#047857'
            }}>
              {formattedTimer}
            </p>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 style={{
              color: '#047857',
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              position: 'relative',
              paddingBottom: '0.5rem'
            }}>
              Select Payment Method
              <span style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '50px',
                height: '3px',
                background: 'linear-gradient(45deg, #10b981, #0d9488)',
                borderRadius: '2px'
              }}></span>
            </h3>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              flexWrap: 'wrap'
            }}>
              {/* Bkash Option */}
              <div
                onClick={() => setPaymentMethod('bkash')}
                style={{
                  border: paymentMethod === 'bkash' ? '3px solid #10b981' : '1px solid #d1fae5',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  width: '180px',
                  height: '180px',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '1rem',
                  background: paymentMethod === 'bkash' ? '#f0fdf4' : 'white',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
                }}
              >
                <img 
                  src="../bkash4.png" 
                  alt="Bkash" 
                  style={{ 
                    width: '80%', 
                    height: 'auto',
                    filter: paymentMethod === 'bkash' ? 'none' : 'grayscale(20%)'
                  }} 
                />
                <span style={{ 
                  fontWeight: 'bold', 
                  color: paymentMethod === 'bkash' ? '#e5383b' : '#6b7280', 
                  fontSize: '1.1rem'
                }}>
                  Bkash
                </span>
              </div>

              {/* Nagad Option */}
              <div
                onClick={() => setPaymentMethod('nagad')}
                style={{
                  border: paymentMethod === 'nagad' ? '3px solid #10b981' : '1px solid #d1fae5',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  width: '180px',
                  height: '180px',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '1rem',
                  background: paymentMethod === 'nagad' ? '#f0fdf4' : 'white',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
                }}
              >
                <img 
                  src="../nagad.png" 
                  alt="Nagad" 
                  style={{ 
                    width: '80%', 
                    height: 'auto',
                    filter: paymentMethod === 'nagad' ? 'none' : 'grayscale(20%)'
                  }} 
                />
                <span style={{ 
                  fontWeight: 'bold', 
                  color: paymentMethod === 'nagad' ? '#1c47a9' : '#6b7280', 
                  fontSize: '1.1rem'
                }}>
                  Nagad
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            marginTop: '2rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={openModal}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                background: 'linear-gradient(45deg, #10b981, #0d9488)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
              }}
            >
              Confirm Payment
            </button>

            <button
              onClick={() => setCancelModalOpen(true)}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
              }}
            >
              Cancel Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Transaction ID Modal"
        ariaHideApp={false}
      >
        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
          <h4 style={{ 
            color: '#047857',
            fontSize: '1.3rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>
            Add Transaction Amount
          </h4>
          <button
            onClick={closeModal}
            style={{ 
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              background: '#ef4444',
              color: 'white',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem'
            }}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <input
          type="text"
          placeholder={`Enter ${ticketData.total_cost} taka`}
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '12px',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #d1fae5',
            fontSize: '1rem',
            outline: 'none',
            transition: 'all 0.3s ease'
          }}
        />
        <button
          onClick={handleConfirmPayment}
          style={{
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: '600',
            background: 'linear-gradient(45deg, #10b981, #0d9488)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 5px 15px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Confirm Payment
        </button>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onRequestClose={() => setCancelModalOpen(false)}
        style={{
          ...customStyles,
          content: {
            ...customStyles.content,
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
          }
        }}
        contentLabel="Cancel Ticket Modal"
        ariaHideApp={false}
      >
        <h4 style={{ 
          color: '#b91c1c',
          fontSize: '1.3rem',
          fontWeight: '600',
          marginBottom: '1.5rem'
        }}>
          Are you sure you want to cancel this ticket?
        </h4>
        <div style={{ 
          marginTop: '1.5rem', 
          display: 'flex', 
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <button
            onClick={handleCancelTicket}
            style={{ 
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              background: 'linear-gradient(45deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              flex: 1,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 5px 15px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Yes, Cancel
          </button>
          <button
            onClick={() => setCancelModalOpen(false)}
            style={{ 
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              background: 'white',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              flex: 1,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            No
          </button>
        </div>
        {cancelSuccess && (
          <p style={{ 
            marginTop: '1.5rem', 
            color: '#047857', 
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {cancelSuccess}
          </p>
        )}
      </Modal>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .about-section-container {
            padding-top: 100px !important;
          }
          
          .about-section-container > div {
            margin: 1rem !important;
            border-radius: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TicketBookingPage;