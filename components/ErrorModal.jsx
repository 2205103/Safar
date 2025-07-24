import React from 'react';

const popupStyles = {
  container: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: '#ffe5e5',
    color: '#a10000',
    border: '1px solid #ff4d4d',
    borderRadius: '8px',
    padding: '16px 20px',
    width: '300px',
    zIndex: 1000,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#a10000',
    cursor: 'pointer',
  },
  body: {
    fontSize: '14px',
  },
};

const ErrorModal = ({ isOpen, errorMessage, closeModal }) => {
  if (!isOpen) return null;

  return (
    <div style={popupStyles.container}>
      <div style={popupStyles.header}>
        <h3 style={{ margin: 0 }}>Error</h3>
        <button onClick={closeModal} style={popupStyles.closeButton}>&times;</button>
      </div>
      <div style={popupStyles.body}>
        <p>{errorMessage}</p>
      </div>
    </div>
  );
};

export default ErrorModal;
