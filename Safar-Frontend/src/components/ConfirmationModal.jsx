import React from 'react';
import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    padding: '2rem',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
    maxWidth: '500px',
    width: '90%'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(5px)'
  }
};

const ConfirmationModal = ({ isOpen, onRequestClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '1rem'
        }}>{title}</h2>
        <button 
          onClick={onRequestClose} 
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#667eea'
          }}
        >
          &times;
        </button>
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ marginBottom: '1rem', color: '#333' }}>
          {message}
        </p>
      </div>
      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'flex-end'
      }}>
        <button 
          onClick={onRequestClose}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6c757d, #495057)',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          Cancel
        </button>
        <button 
          onClick={onConfirm}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;