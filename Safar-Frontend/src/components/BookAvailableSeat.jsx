import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from './utils';
import { useData } from './AppContext';

const BookAvailableSeat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logOut } = useData();

  const [trainCode, setTrainCode] = useState('');
  const [trainName, setTrainName] = useState('');
  const [className, setClassName] = useState('');
  const [date, setDate] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [totalSeat, setTotalSeat] = useState(0);
  const [unavailableSeats, setUnavailableSeats] = useState([]);
  const [availableSeatArr, setAvailableSeatArr] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const [seatCost, setSeatCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sCost = params.get('seat_cost') || '0';
    setSeatCost(parseFloat(sCost));
  }, [location.search]);

  useEffect(() => {
    setTotalCost(selectedSeats.length * seatCost);
  }, [selectedSeats, seatCost]);

  const classCodeMap = {
    "2nd General": "1",
    "2nd Mail": "2",
    "Commuter": "3",
    "Sulav": "4",
    "Shovon": "5",
    "Shovon Chair": "6",
    "1st Chair/ Seat": "7",
    "1st Berth": "8",
    "Snigdha": "9",
    "AC seat": "10"
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tCode = params.get('trainCode') || '';
    const cName = params.get('className') || '';
    const journeyDate = params.get('date') || '';
    const fromStation = params.get('from') || '';
    const toStation = params.get('to') || '';

    setTrainCode(tCode);
    setClassName(cName);
    setDate(journeyDate);
    setFrom(fromStation);
    setTo(toStation);

    if (tCode && cName && journeyDate && fromStation && toStation) {
      fetchSeatData(tCode, cName, journeyDate, fromStation, toStation);
    }
  }, [location.search]);

  const fetchSeatData = async (tCode, cName, journeyDate, fromStation, toStation) => {
    try {
      const body = { fromcity: fromStation, tocity: toStation, doj: journeyDate };

      const response = await fetchWithAuth('http://localhost:5000/booking/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }, navigate);

      const data = await response.json();

      if (response.ok && data.data && data.data.length > 0) {
        const train = data.data.find(t => String(t.train_code) === String(tCode));
        if (!train) return alert('Train not found');

        setTrainName(train.train_name);
        const cls = train.classes.find(c => c.class_name === cName);
        if (!cls) return alert('Class not found');

        setTotalSeat(cls.total_seat);
        const bookedSeats = cls.Booked_Seats || [];
        setUnavailableSeats(bookedSeats);

        const bookedSet = new Set(bookedSeats);
        const availableSeats = [];
        for (let i = 1; i <= cls.total_seat; i++) {
          if (!bookedSet.has(i)) availableSeats.push(i);
        }
        setAvailableSeatArr(availableSeats);
      } else {
        alert('Failed to get seat data');
      }
    } catch (err) {
      console.error('Error fetching seat data:', err);
      alert('Error fetching seat data');
    }
  };

  const handleSeatToggle = (seatNum) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatNum)) {
        return prev.filter(s => s !== seatNum);
      } else {
        if (prev.length >= 4) {
          alert('You can select up to 4 seats only.');
          return prev;
        }
        return [...prev, seatNum].sort((a, b) => a - b);
      }
    });
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat.');
      return;
    }

    const bookingBody = {
      Train_Code: trainCode,
      Date: date,
      From_Station: from,
      To_Station: to,
      Seat_Details: [{
        Class_Code: classCodeMap[className] || "1",
        Seat_Number: selectedSeats,
      }],
    };

    try {
      const token = localStorage.getItem('token');
      const res = await fetchWithAuth('http://localhost:5000/booking/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(bookingBody),
      }, navigate, logOut);

      const responseJson = await res.json();

      if (res.ok) {
        navigate('/booking/ticket', { state: { ticketId: responseJson.ticket_id } });
      } else if (res.status === 413) {
        alert('You have booked another ticket on this date, you cannot book another');
        navigate('/booking/train/search');
      } else {
        alert(responseJson.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      //alert('Booking failed due to network error');
    }
  };

  const SeatButton = ({ number }) => {
    const isAvailable = availableSeatArr.includes(number);
    const isSelected = selectedSeats.includes(number);
    const label = `${className}-${number}`;

    return (
      <div
        onClick={() => isAvailable && handleSeatToggle(number)}
        style={{
          padding: '12px 8px',
          margin: '5px',
          borderRadius: '8px',
          backgroundColor: isSelected ? '#10b981' :  // Light blue for selected seats
                       !isAvailable ? '#d0cfd0ff' :   // White for unavailable seats
                       '#a460a1ff',                  // Original teal for available seats
          color: isAvailable ? 'white' : '#000000ff', // Dark text for unavailable seats
          textAlign: 'center',
          cursor: isAvailable ? 'pointer' : 'not-allowed',
          width: '80px',
          boxSizing: 'border-box',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '14px',
          transition: 'all 0.3s ease',
          transform: isSelected ? 'scale(1.05)' : 'scale(1)',
          border: !isAvailable ? '1px solid #e5e7eb' : 'none' // Add border for unavailable seats
        }}
      >
        {label}
      </div>
    );
  };

  const renderSeats = () => {
    const seatRows = [];
    const halfwayPoint = Math.ceil(totalSeat / 2);
    let riftAdded = false;

    if (className === 'AC seat') {
      for (let i = 0; i < totalSeat; i += 4) {
        const rowSeats = [];
        for (let j = 0; j < 4; j++) {
          const seatNumber = i + j + 1;
          if (seatNumber <= totalSeat) {
            rowSeats.push(<SeatButton key={seatNumber} number={seatNumber} />);
          } else {
            // Render an empty placeholder div to maintain spacing
            rowSeats.push(<div key={`placeholder-${seatNumber}`} style={{ width: '80px', margin: '5px' }}></div>);
          }
        }
        seatRows.push(
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between', // Use space-between for consistent spacing
              marginBottom: '15px',
              alignItems: 'flex-start'
            }}
          >
            {rowSeats}
          </div>
        );
      }
    } else {
      for (let i = 0; i < totalSeat; i += 5) {
        if (!riftAdded && (i + 1) > halfwayPoint) {
          seatRows.push(
            <div key="rift" style={{
              width: '1597.1%',
            height: '30px',
            backgroundColor: 'transparent',
            margin: '20px -748.5%',
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: 'none',
            borderBottom: 'none'
            }}>
            </div>
          );
          riftAdded = true;
        }

        seatRows.push(
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '15px',
              alignItems: 'flex-start'
            }}
          >
            {/* Left group - 2 seats */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {i + 1 <= totalSeat && <SeatButton number={i + 1} />}
              {i + 2 <= totalSeat && <SeatButton number={i + 2} />}
            </div>

            {/* Right group - 3 seats with large gap */}
            <div style={{ display: 'flex', gap: '10px', marginLeft: '80px' }}>
              {i + 3 <= totalSeat && <SeatButton number={i + 3} />}
              {i + 4 <= totalSeat && <SeatButton number={i + 4} />}
              {i + 5 <= totalSeat && <SeatButton number={i + 5} />}
            </div>
          </div>
        );
      }
    }

    return seatRows;
  };

  return (
    <div className="about-section-container" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #0d9488 100%)',
      padding: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '80px'
    }}>
      <div style={{
        maxWidth: '900px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        animation: 'fadeInUp 0.8s ease-out',
        marginTop: '20px'
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
            fontSize: '1.8rem',
            marginBottom: '0.5rem',
            position: 'relative',
            zIndex: 1,
            opacity: 0.9,
            letterSpacing: '1px'
          }}>Book Seats for {trainName}</h2>
          <p style={{
            color: '#ffffff',
            fontSize: '1.2rem',
            position: 'relative',
            zIndex: 1,
            opacity: 0.9
          }}>{className} Class</p>
        </div>

        <div style={{
          padding: '2rem'
        }}>
          {/* Journey Info */}
          <div style={{
            background: 'linear-gradient(120deg, rgba(16, 185, 129, 0.1), rgba(13, 148, 136, 0.1))',
            padding: '1.5rem',
            borderRadius: '12px',
            borderLeft: '4px solid #10b981',
            marginBottom: '2rem',
            transform: 'scale(1)',
            transition: 'all 0.3s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div>
                <p style={{ color: '#047857', fontWeight: '600', marginBottom: '0.3rem' }}>Date</p>
                <p style={{ color: '#374151' }}>{date}</p>
              </div>
              <div>
                <p style={{ color: '#047857', fontWeight: '600', marginBottom: '0.3rem' }}>From</p>
                <p style={{ color: '#374151' }}>{from}</p>
              </div>
              <div>
                <p style={{ color: '#047857', fontWeight: '600', marginBottom: '0.3rem' }}>To</p>
                <p style={{ color: '#374151' }}>{to}</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <div>
                <p style={{ color: '#047857', fontWeight: '600', marginBottom: '0.3rem' }}>Total Seats</p>
                <p style={{ color: '#374151' }}>{totalSeat}</p>
              </div>
              <div>
                <p style={{ color: '#047857', fontWeight: '600', marginBottom: '0.3rem' }}>Available Seats</p>
                <p style={{ color: '#374151' }}>{availableSeatArr.length}</p>
              </div>
            </div>
          </div>

          {/* Seat Selection */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            marginBottom: '2rem'
          }}>
            <h3 style={{ 
              color: '#047857',
              fontSize: '1.3rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              position: 'relative',
              paddingBottom: '0.5rem'
            }}>
              Select Your Seats
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
            <div style={{ width: '100%' }}>
              {renderSeats()}
            </div>
          </div>

          {/* Selected Seats */}
          <div style={{
            background: 'linear-gradient(120deg, rgba(16, 185, 129, 0.1), rgba(13, 148, 136, 0.1))',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '2rem',
          }}>
            <h4 style={{ 
              color: '#047857',
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '0.8rem'
            }}>Selected Seats</h4>
            <p style={{ 
              color: '#374151',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              {selectedSeats.length > 0 ? 
                selectedSeats.map(s => `${className}-${s}`).join(', ') : 
                'No seats selected yet'}
            </p>
          </div>

          {/* Total Cost */}
          <div style={{
            background: 'linear-gradient(120deg, rgba(16, 185, 129, 0.1), rgba(13, 148, 136, 0.1))',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '2rem',
          }}>
            <h4 style={{
              color: '#047857',
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '0.8rem'
            }}>Total Cost</h4>
            <p style={{
              color: '#374151',
              fontSize: '1.2rem',
              fontWeight: '700'
            }}>
              ৳{totalCost.toFixed(2)}
            </p>
          </div>

          {/* Book Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleBooking}
              disabled={selectedSeats.length === 0}
              style={{
                padding: '0.8rem 2rem',
                borderRadius: '50px',
                border: 'none',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: selectedSeats.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                background: selectedSeats.length > 0 ? 
                  'linear-gradient(45deg, #10b981, #0d9488)' : '#e5e7eb',
                color: selectedSeats.length > 0 ? 'white' : '#9ca3af',
                boxShadow: selectedSeats.length > 0 ? 
                  '0 4px 15px rgba(16, 185, 129, 0.3)' : 'none',
                width: '100%',
                maxWidth: '200px'
              }}
              onMouseEnter={(e) => {
                if (selectedSeats.length > 0) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedSeats.length > 0) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                }
              }}
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

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
            padding: 1rem !important;
          }
          
          .about-section-container > div {
            margin: 0.5rem !important;
            border-radius: 16px !important;
          }
          
          .journey-info {
            flex-direction: column !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BookAvailableSeat;