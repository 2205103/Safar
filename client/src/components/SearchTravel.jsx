import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { useData } from './AppContext';
import './comp.css';
import 'react-datepicker/dist/react-datepicker.css';

const SearchTravel = () => {
  const { setDates, setFromStationSearch, setToStationSearch } = useData();

  const [inputValueFrom, setInputValueFrom] = useState('');
  const [inputValueTo, setInputValueTo] = useState('');
  const [stationOptions, setStationOptions] = useState([]);
  const [dateSearched, setDate] = useState(null);
  const [trains, setTrains] = useState([]);
  const [searchClicked, setSearchClicked] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('stationNames');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setStationOptions(parsed);

        }
      } catch (e) {
        console.error('Error parsing stationNames from localStorage:', e);
      }
    }
  }, []);

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const onSearchFunc = async () => {
    if (!inputValueFrom || !inputValueTo || !dateSearched) {
      alert('Please fill From, To and Date fields.');
      return;
    }

    try {
      setDates(dateSearched);
      setFromStationSearch(inputValueFrom);
      setToStationSearch(inputValueTo);
      setSearchClicked(true);

      const body = {
        fromcity: inputValueFrom,
        tocity: inputValueTo,
        doj: formatDate(dateSearched),
      };

      const response = await fetch('http://localhost:5000/booking/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const res = await response.json();

      if (response.ok) {
        setTrains(res.data || []);
      } else {
        alert(res.message || 'Search failed');
        setTrains([]);
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong with the search.');
      setTrains([]);
    }
  };

  return (
    <Fragment>
      <div style={{ marginTop: '40px' }}>
        <div className="input-container">
          <label htmlFor="from" className="label">From: </label>
          <select
            id="from"
            value={inputValueFrom}
            onChange={(e) => setInputValueFrom(e.target.value)}
            style={{
              width: '300px',
              marginRight: '10px',
              height: '40px',
              borderRadius: '5px',
              border: '2px solid darkgreen',
            }}
          >
            <option value="">-- Select From Station --</option>
            {stationOptions.map((station, idx) => (
              <option key={idx} value={station}>{station}</option>
            ))}
          </select>
        </div>

        <div className="input-container">
          <label htmlFor="to" className="label">To: </label>
          <select
            id="to"
            value={inputValueTo}
            onChange={(e) => setInputValueTo(e.target.value)}
            style={{
              width: '300px',
              marginRight: '10px',
              height: '40px',
              borderRadius: '5px',
              border: '2px solid darkgreen',
            }}
          >
            <option value="">-- Select To Station --</option>
            {stationOptions.map((station, idx) => (
              <option key={idx} value={station}>{station}</option>
            ))}
          </select>
        </div>

        <div className="input-container">
          <label htmlFor="date" className="label">Pick Date: </label>
          <DatePicker
            className="datePicker2"
            placeholderText="Date of Journey"
            showIcon
            selected={dateSearched}
            onChange={setDate}
            dateFormat="yyyy-MM-dd"
            minDate={new Date()}
            maxDate={new Date(new Date().setDate(new Date().getDate() + 9))}
          />
        </div>

        <button onClick={onSearchFunc} className="button" style={{ width: '200px' }}>
          Search
        </button>

        {searchClicked && trains.length === 0 && (
          <div className="not found mt-5">
            <h5>No trains found!</h5>
          </div>
        )}
      </div>

      <div className="train-container mt-5">
        {trains.map((train, idx) => (
          <div
            key={idx}
            className="train-card"
            style={{ marginBottom: '30px', border: '1px solid gray', padding: '15px' }}
          >
            <h4>{train.train_code} - {train.train_name}</h4>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                marginTop: '10px',
              }}
            >
              {train.classes.map((cls, i) => {
                const bookedSeatsCount = Array.isArray(cls.Booked_Seats) ? cls.Booked_Seats.length : 0;
                const availableSeats = cls.total_seat - bookedSeatsCount;

                return (
                  <div
                    key={i}
                    className="class-card"
                    style={{
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      padding: '10px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <div><strong>Class:</strong> {cls.class_name}</div>
                    <div><strong>Total Seats:</strong> {cls.total_seat}</div>
                    <div><strong>Available Seats:</strong> {availableSeats}</div>
                    <div style={{ marginTop: '10px' }}>
                      {availableSeats > 0 ? (
                        <Link
                          to={`/bookseat?trainCode=${train.train_code}&className=${cls.class_name}&classCode=${cls.class_code}&date=${formatDate(dateSearched)}&from=${inputValueFrom}&to=${inputValueTo}`}
                          className="button"
                          style={{ width: '100%', display: 'inline-block', textAlign: 'center' }}
                        >
                          Book Now
                        </Link>
                      ) : (
                        <div
                          className="button"
                          style={{
                            backgroundColor: 'red',
                            width: '100%',
                            textAlign: 'center',
                          }}
                        >
                          Unavailable!
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Fragment>
  );
};

export default SearchTravel;
