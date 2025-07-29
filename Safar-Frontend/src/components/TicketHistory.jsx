import React, { Fragment, useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { useData } from './AppContext';
import './ticketBook.css';
import Modal from 'react-modal';
import './comp.css'
import { MdOutlineDeleteOutline } from "react-icons/md";
import { Link, json } from 'react-router-dom';
import { MdOutlineCancel } from "react-icons/md";
import Popup from './Popup';
// import './history.css';


const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        border: '2px solid #0e360e'

    },
};

const customStyles2 = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        border: '2px solid #0e360e',
        width: '70%',
        maxWidth: '500px',
    },
};


function formattime(time24) {
    const [hours, minutes] = time24.split(":");
    const parsedHours = parseInt(hours, 10);
    const period = parsedHours >= 12 ? "PM" : "AM";
    const hours12 = parsedHours % 12 || 12;
    return `${hours12}:${minutes} ${period}`;
}

function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${month}-${day}-${year}`;
}


function formatDate2(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}


const TicketHistory = () => {
    const { userId } = useData();
    const [ticketHistory, setTicketHistory] = useState([]);
    const [seatmap, setSeatmap] = useState({});
    const [ticketTransactionMap, setTicketTransactionMap] = useState({});
    const [timeMap, setTimeMap] = useState({});
    // const [showModal, setShowModal] = useState(false);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [oldTransactionId, setOldTransactionId] = useState(null);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);
    const [transModeMap, setTransModeMap] = useState({});
    const [journey_map, setJourney_map] = useState({});
    const [transMode, setTransMode] = useState('');
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [review, setReview] = useState('');
    const [rating, setRating] = useState(0);
    const [expandedTransactions, setExpandedTransactions] = useState({});
    const [trainName, setTrainName] = useState('');
    const [className, setClassName] = useState('');
    const [popup, setPopup] = useState({ show: false, message: '' });
    // const [refund_status, setRefund_status] = useState('');
    const toggleDropdown = (transactionId) => {
        setExpandedTransactions(prev => ({
            ...prev,
            [transactionId]: !prev[transactionId],
        }));
    };



    useEffect(() => {
        const fetchTicketHistory = async () => {
            try {
                if (!userId) return;

                const response = await fetch(`http://localhost:3001/users/${userId}/tickets`);
                if (!response.ok) {
                    throw new Error('Failed to fetch ticket history');
                }
                const data = await response.json();
                console.log("data:///", data);
                setTicketHistory(data.data.tickets);
                setSeatmap(data.data.map);
                setTimeMap(data.data.time);


                // console.log("timeMap", timeMap);
                const ttMap = {};
                data.data.tickets.forEach(ticket => {
                    if (!ttMap[ticket.transaction_id]) {
                        ttMap[ticket.transaction_id] = [];
                    }
                    ttMap[ticket.transaction_id].push(ticket.ticket_id);
                });
                setTicketTransactionMap(ttMap);
                // console.log("ttMap", ttMap);
                setTransModeMap(data.data.transMode);
                // console.log("///", transModeMap);
                setJourney_map(data.data.journeyMap);
                // console.log("journey_map", journey_map[-20].trainName);
            } catch (error) {
                console.error(error.message);
            }
        };

        fetchTicketHistory();
    }, [userId]);


    function deleteTransaction(transactionId) {
        const deleteTrans = async () => {
            try {
                const response = await fetch(`http://localhost:3001/transaction/delete/${transactionId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ transactionId }),
                });
                const data = await response.json();
                console.log("data", data);
            } catch (error) {
                console.error(error.message);
            }
        }
        deleteTrans();
        window.location.reload();

    }


    function openModal(transactionId) {
        // console.log("ticketId", ticketId);
        setIsOpen(true);

        setOldTransactionId(transactionId);
        setIsOpen(true);
    }

    function openModal1(transactionId) {
        const refund = async (transactionId) => {

            try {
                console.log('///////////////////////////////////////refund clickec')
                const response = await fetch(`http://localhost:3001/transaction/refund/${userId}/${transactionId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ transactionId }),
                });
                const data = await response.json();
                console.log("data", data);
                // setRefund_status(data.message);
                if (response.status === 200) {
                    setPopup({ show: true, message: data.message });
                }
                else if (response.status === 400) {
                    setPopup({ show: true, message: data.message });
                }
                console.log("data", data);
            } catch (error) {
                console.error(error.message);
            }

        }

        refund(transactionId);
        // alert(refund_status);
        // window.location.reload();
        // window.location.reload();

    }

    function closeModal() {
        setIsOpen(false);
        // console.log("//// selectedTransactionId : ", selectedTransactionId);
        // console.log("//// oldTransactionId : ", oldTransactionId);
        sendTransactionId(selectedTransactionId, oldTransactionId, transMode);
        //window.location.reload();
    }

    const sendTransactionId = async (transactionId, oldTransactionId, transMode) => {
        try {
            const response = await fetch(`http://localhost:3001/transaction/${userId}/${transactionId}/${oldTransactionId}/${transMode}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ transactionId }),
            });
            const data = await response.json();
            // console.log("data", data);
            if (response.status === 400) {
                console.log("haha")

                setPopup({ show: true, message: "Transaction id already in use" });
            }
            else {
                window.location.reload();

            }

        } catch (error) {
            console.error(error.message);
        }
    }



    function handlePaymentMethodSelect(method) {
        setTransMode(method);
        console.log("********, ", method);
    }


    const transactionsByDOJ = {};
    Object.entries(journey_map).forEach(([transactionId, { doj }]) => {
        const formattedDate = formatDate(doj);
        if (!transactionsByDOJ[formattedDate]) {
            transactionsByDOJ[formattedDate] = [];
        }
        transactionsByDOJ[formattedDate].push(transactionId);
    });




    function openModal2(t_name, c_name) {
        setReview('');
        setRating(0);
        console.log("clicked");
        console.log("t_name", t_name);
        console.log("c_name", c_name);
        setReviewModalOpen(true);
        setTrainName(t_name);
        setClassName(c_name);
    }

    const sendReview = async () => {
        setReviewModalOpen(false);

        console.log("review : ", review);
        try {
            console.log("rating  : " + rating);
            const response = await fetch(`http://localhost:3001/send/review/${userId}/${trainName}/${className}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ review, rating }),
            });
            const data = await response.json();
            console.log("data", data);
        }
        catch (error) {
            console.error(error.message);
        }
        // setReviewModalOpen(false);

        window.location.reload();
        console.log("bblah")
    }

    return (
        <Fragment>



            {Object.entries(ticketTransactionMap).map(([transactionId, ticketIds]) => (
                <div key={transactionId}>
                    {/* {console.log("transactionId", transactionId)} */}

                    <div onClick={() => toggleDropdown(transactionId)}>

                        <div className="journey-info" >
                            {journey_map[transactionId] ? (
                                journey_map[transactionId].status === 'pending' ? (
                                    <>
                                        {formatDate2(journey_map[transactionId].doj)}, {' '}

                                        {journey_map[transactionId].trainName}, {' '}
                                        {journey_map[transactionId].className}

                                        <span style={{ padding: '0 120px' }} className="spacer"></span>
                                        <button onClick={() => openModal(transactionId)} style={{ backgroundColor: '#ffc107', color: '#212529', border: 'none', padding: '8px 20px', cursor: 'pointer', borderRadius: '20px', justifyContent:'flex-end' }} className="btn btn-warning">
                                            Proceed to pay
                                        </button>

                                        <button onClick={() => deleteTransaction(transactionId)} style={{ backgroundColor: 'white', color: '#212529', border: 'none', padding: '8px 20px', cursor: 'pointer', borderRadius: '20px',  justifyContent:'flex-end'  }}>
                                            <MdOutlineCancel />
                                        </button>
                                    </>
                                ) : (
                                    journey_map[transactionId].status === 'confirmed' ? (
                                        <>
                                            {formatDate(journey_map[transactionId].doj)}, {' '}

                                            {journey_map[transactionId].trainName}, {' '}
                                            {journey_map[transactionId].className}
                                            <span style={{ padding: '0 120px' }} className="spacer"></span>

                                            {new Date(formatDate(journey_map[transactionId].doj)) < new Date() ? (<></>) : (
                                                <button onClick={() => openModal1(transactionId)} style={{ backgroundColor: '#ffc107', color: '#212529', border: 'none', padding: '8px 20px', cursor: 'pointer', borderRadius: '20px' }} className="button-container">
                                                    Refund
                                                </button>)}


                                            {/* {console.log(journey_map[transactionId].reviewBool)} */}
                                            {journey_map[transactionId].reviewBool === -1 ? null :
                                                journey_map[transactionId].reviewBool === 0 ? (
                                                    <button onClick={() => openModal2(journey_map[transactionId].trainName, journey_map[transactionId].className)} style={{
                                                        backgroundColor: '#6AA84F',
                                                        color: '#212529',
                                                        border: 'none',
                                                        padding: '8px 17px',
                                                        cursor: 'pointer',
                                                        borderRadius: '20px',
                                                        fontSize: '17px',
                                                        marginLeft: '220px',
                                                        justifyContent:'flex-end' 
                                                    }} className="btn btn-success review-btn">Review</button>
                                                ) : (
                                                    <Link to={`/review?trainId=${journey_map[transactionId].train_id}&classId=${journey_map[transactionId].class_id}`} style={{
                                                        display: 'inline-block',
                                                        marginLeft: '200px',
                                                        fontSize: '16px',
                                                        border: '2px solid #6AA84F',
                                                        borderRadius: '25px',
                                                        padding: '7px 15px',
                                                        textDecoration: 'none',
                                                        color: '#212529',
                                                        backgroundColor: '#6AA84F',
                                                        cursor: 'pointer',
                                                        justifyContent:'flex-end' 
                                                    }}
                                                        className="btn btn-success review-btn">Go to Review</Link>
                                                )
                                            }


                                            <Modal isOpen={reviewModalOpen} onRequestClose={() => setReviewModalOpen(false)} style={customStyles2}>
                                                <div>
                                                    <h4>Rating</h4>
                                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                        {[...Array(5)].map((_, index) => {
                                                            const ratingValue = index + 1;
                                                            return (
                                                                <FaStar
                                                                    key={index}
                                                                    color={ratingValue <= rating ? '#ffc107' : '#e4e5e9'}
                                                                    size={30}
                                                                    style={{ marginRight: '5px', cursor: 'pointer' }}
                                                                    onClick={() => setRating(ratingValue)}
                                                                />
                                                            );
                                                        })}
                                                    </div>


                                                    <h4>Review</h4>

                                                    <input type="text" placeholder="Enter Review"
                                                        value={review}
                                                        onChange={(e) => setReview(e.target.value)} style={{
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            borderRadius: '5px',
                                                            border: '2px solid #0e360e',
                                                            borderColor: '#0e360e',
                                                            width: '100%'
                                                        }} />
                                                    <button onClick={() => sendReview()} style={{ marginTop: '5px' }}>Submit</button>
                                                </div>
                                            </Modal>
                                        </>
                                    ) : (<>
                                        {formatDate(journey_map[transactionId].doj)}, {' '}

                                        {journey_map[transactionId].trainName}, {' '}
                                        {journey_map[transactionId].className}

                                        <span style={{ padding: '0 230px' }} className="spacer"></span>

                                        <button style={{ backgroundColor: '#cc0000', color: 'white', border: 'none', padding: '8px 20px', cursor: 'not-allowed', borderRadius: '20px'  }} className="btn btn-warning">
                                            Cancelled
                                        </button>
                                        <button onClick={() => deleteTransaction(transactionId)} style={{ backgroundColor: 'white', color: '#212529', border: 'none', padding: '8px 50px 8px 5px', cursor: 'pointer', borderRadius: '20px' }}>
                                            <MdOutlineDeleteOutline />
                                        </button>
                                    </>

                                    )
                                )
                            ) : <></>}


                        </div>
                    </div>

                    <span style={{ marginTop: '20px' }}></span>

                    {expandedTransactions[transactionId] && (
                        <ul className='ticket-details-list'>
                            {ticketIds.map(ticketId => {
                                const ticket = ticketHistory.find(ticket => ticket.ticket_id === ticketId);
                                return (
                                    <li key={ticketId}>
                                        <p><strong>Ticket ID:</strong> {ticketId}</p>
                                        <p><strong>Time:</strong> {ticket ? formattime(timeMap[ticket.ticket_id]) : ''}</p>
                                        <p><strong>Seat number:</strong> {seatmap[ticketId]}</p>
                                        <p><strong>Transaction Mode:</strong> {transModeMap[ticket.ticket_id]}</p>
                                        <p><strong>Route : </strong> {journey_map[transactionId].from}-{journey_map[transactionId].to}</p>
                                        <p><strong>Price:</strong> {ticket ? ticket.price : ''}</p>
                                        <span style={{ marginLeft: '150px' }}></span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            ))}
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles}>
                <div>
                    <input
                        type="checkbox"
                        id="bkashCheckbox"
                        checked={transMode === 'bkash'}
                        onChange={() => handlePaymentMethodSelect('bkash')}
                    />
                    <label htmlFor="bkashCheckbox">Bkash</label>
                </div>
                <div>
                    <input
                        type="checkbox"
                        id="nagadCheckbox"
                        checked={transMode === 'nagad'}
                        onChange={() => handlePaymentMethodSelect('nagad')}
                    />
                    <label htmlFor="nagadCheckbox">Nagad</label>
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Enter transaction ID"
                        value={selectedTransactionId}
                        onChange={(e) => setSelectedTransactionId(e.target.value)}
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: '5px',
                            border: '2px solid #0e360e',
                            borderColor: '#0e360e'
                        }}

                    />
                </div>

                <button className='button' onClick={closeModal} style={{ marginTop: '5px' }}>Confirm</button>
            </Modal>

            {popup.show && <Popup message={popup.message} onClose={() => setPopup({ show: false, message: '' })} />}
        </Fragment>
    );

};

export default TicketHistory;
