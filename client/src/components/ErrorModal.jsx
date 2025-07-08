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
    width: '50%', 
    maxWidth: '400px', 
  },
};


const ErrorModal = ({ isOpen, errorMessage, closeModal }) => {
  return (
    <Modal
      isOpen={isOpen}
      style={customStyles}
      onRequestClose={closeModal}
      contentLabel="Error Modal"
    >
      <div className="modal-header">
        <h2>Error!</h2>
        <button onClick={closeModal} className="close">
          &times;
        </button>
      </div>
      <div className="modal-body">
        <p>{errorMessage}</p>
      </div>
    </Modal>
  );
};

export default ErrorModal;
