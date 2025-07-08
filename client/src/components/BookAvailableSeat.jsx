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

  // Map class name to class code (adjust according to your backend)
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
      const body = {
        fromcity: fromStation,
        tocity: toStation,
        doj: journeyDate,
      };

      const response = await fetch('http://localhost:5000/booking/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok && data.data && data.data.length > 0) {
        const train = data.data.find(t => String(t.train_code) === String(tCode));
        if (!train) {
          alert('Train not found');
          return;
        }
        setTrainName(train.train_name);

        const cls = train.classes.find(c => c.class_name === cName);
        if (!cls) {
          alert('Class not found');
          return;
        }

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
      Seat_Details: [
        {
          Class_Code: classCodeMap[className] || "1",
          Seat_Number: selectedSeats,
        },
      ],
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

  return (
    <div style={{ padding: '20px' }}>
      <h2>Booking seats for {trainName} - {className}</h2>
      <p>Date: {date}</p>
      <p>From: {from}</p>
      <p>To: {to}</p>
      <p>Total Seats: {totalSeat}</p>
      <p>Available Seats: {availableSeatArr.length}</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: '600px' }}>
        {Array.from({ length: totalSeat }, (_, i) => i + 1).map(seatNum => {
          const isAvailable = availableSeatArr.includes(seatNum);
          const isSelected = selectedSeats.includes(seatNum);

          return (
            <label
              key={seatNum}
              style={{
                margin: '5px',
                padding: '8px 12px',
                border: '1px solid #444',
                borderRadius: '4px',
                backgroundColor: !isAvailable ? '#ddd' : isSelected ? '#6c6' : '#fff',
                cursor: isAvailable ? 'pointer' : 'not-allowed',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                disabled={!isAvailable}
                checked={isSelected}
                onChange={() => handleSeatToggle(seatNum)}
                style={{ marginRight: '6px' }}
              />
              {seatNum}
            </label>
          );
        })}
      </div>

      <p style={{ marginTop: '20px' }}>
        Selected Seats: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
      </p>

      <button
        onClick={handleBooking}
        disabled={selectedSeats.length === 0}
        style={{ marginTop: '10px', padding: '10px 20px', fontSize: '16px' }}
      >
        Book Now
      </button>
    </div>
  );
};

export default BookAvailableSeat;
