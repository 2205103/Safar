import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BookAvailableSeat = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

      const response = await fetch('http://localhost:5000/booking/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

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
      const res = await fetch('http://localhost:5000/booking/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(bookingBody),
      });

      const responseJson = await res.json();

      if (res.ok) {
        navigate('/booking/ticket', { state: { ticketId: responseJson.ticket_id } });
      } else {
        alert(responseJson.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed due to network error');
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
          backgroundColor: isSelected ? '#28a745' : !isAvailable ? '#ccc' : '#87CEEB',
          color: 'white',
          textAlign: 'center',
          cursor: isAvailable ? 'pointer' : 'not-allowed',
          width: '80px',
          boxSizing: 'border-box',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '14px'
        }}
      >
        {label}
      </div>
    );
  };

  const renderSeats = () => {
    const seatRows = [];
    
    for (let i = 0; i < totalSeat; i += 5) {
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

    return seatRows;
  };

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Booking seats for {trainName} - {className}</h2>
      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <p><strong>Date:</strong> {date}</p>
        <p><strong>From:</strong> {from} | <strong>To:</strong> {to}</p>
        <p><strong>Total Seats:</strong> {totalSeat} | <strong>Available Seats:</strong> {availableSeatArr.length}</p>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '10px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#555' }}>Select Your Seats</h3>
        <div style={{ width: '100%' }}>
          {renderSeats()}
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <p style={{ fontWeight: 'bold' }}>
          Selected Seats: {selectedSeats.length > 0 ? selectedSeats.map(s => `${className}-${s}`).join(', ') : 'None'}
        </p>
      </div>

      <button
        onClick={handleBooking}
        disabled={selectedSeats.length === 0}
        style={{
          marginTop: '15px',
          padding: '12px 30px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'background-color 0.3s',
          width: '100%',
          maxWidth: '200px'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
      >
        Book Now
      </button>
    </div>
  );
};

export default BookAvailableSeat;