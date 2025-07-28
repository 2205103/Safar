import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { useData } from './AppContext';
import { fetchWithAuth } from './utils';
import './comp.css';
import 'react-datepicker/dist/react-datepicker.css';

const SearchTravel = () => {
  const { setDates, setFromStationSearch, setToStationSearch } = useData();
  const navigate = useNavigate();

  const [inputValueFrom, setInputValueFrom] = useState('');
  const [inputValueTo, setInputValueTo] = useState('');
  const [stationOptions, setStationOptions] = useState([]);
  const [dateSearched, setDate] = useState(null);
  const [trains, setTrains] = useState([]);
  const [searchClicked, setSearchClicked] = useState(false);
  const [expandedTrain, setExpandedTrain] = useState(null);

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

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const toggleTrainDetails = (trainCode) => {
    setExpandedTrain(expandedTrain === trainCode ? null : trainCode);
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
      setExpandedTrain(null);

      const body = {
        fromcity: inputValueFrom,
        tocity: inputValueTo,
        doj: formatDate(dateSearched),
      };

      const response = await fetchWithAuth('http://localhost:5000/booking/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }, navigate);

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
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      flexDirection: 'column'
    }}>
      <div className="search-card" style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '24px',
        padding: '2.5rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        width: '100%',
        maxWidth: '500px'
      }}>
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'rgba(0, 0, 0, 1)',
            fontWeight: '500',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>From:</label>
          <select
            className="form-control"
            style={{
              width: '100%',
              padding: '1rem 1.25rem',
              background: 'rgba(83, 69, 143, 0.9)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              color: 'white',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            value={inputValueFrom}
            onChange={(e) => setInputValueFrom(e.target.value)}
          >
            <option value="">-- Select From Station --</option>
            {stationOptions.map((station, idx) => (
              <option key={idx} value={station}>{station}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'rgba(0, 0, 0, 1)',
            fontWeight: '500',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>To:</label>
          <select
            className="form-control"
            style={{
              width: '100%',
              padding: '1rem 1.25rem',
              background: 'rgba(83, 69, 143, 0.9)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              color: 'white',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            value={inputValueTo}
            onChange={(e) => setInputValueTo(e.target.value)}
          >
            <option value="">-- Select To Station --</option>
            {stationOptions.map((station, idx) => (
              <option key={idx} value={station}>{station}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: 'rgba(0, 0, 0, 1)',
            fontWeight: '500',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>Pick Date:</label>
          <DatePicker
            className="form-control"
            style={{
              width: '100%',
              padding: '1rem 1.25rem',
              background: 'rgba(83, 69, 143, 0.9)',
              border: '2px solid rgba(83, 69, 143, 0.9)',
              borderRadius: '16px',
              color: 'white',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            placeholderText="Date of Journey"
            selected={dateSearched}
            onChange={setDate}
            dateFormat="yyyy-MM-dd"
            minDate={new Date()}
            maxDate={new Date(new Date().setDate(new Date().getDate() + 9))}
          />
        </div>

        <button 
          onClick={onSearchFunc} 
          className="search-btn"
          style={{
            width: '100%',
            padding: '1.25rem',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            border: 'none',
            borderRadius: '16px',
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginTop: '1rem',
            boxShadow: '0 10px 30px rgba(79, 70, 229, 0.35)'
          }}
        >
          Search Trains
        </button>
      </div>

      {searchClicked && trains.length === 0 && (
        <div className="not-found" style={{ marginTop: '2rem', color: 'white' }}>
          <h5>No trains found!</h5>
        </div>
      )}

      <div className="train-container" style={{ marginTop: '2rem', width: '100%', maxWidth: '800px' }}>
        {trains.map((train, idx) => (
          <div
            key={idx}
            className="train-card"
            style={{
              marginBottom: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
          >
            <div 
              style={{ 
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: expandedTrain === train.train_code ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                transition: 'background-color 0.3s ease'
              }}
              onClick={() => toggleTrainDetails(train.train_code)}
            >
              <h4 style={{ margin: 0 }}>{train.train_code} - {train.train_name}</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{inputValueFrom}</div>
                  <div style={{ fontWeight: '600' }}>{formatTime(train.from_station_departure)}</div>
                </div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 5px' }}>
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{inputValueTo}</div>
                  <div style={{ fontWeight: '600' }}>{formatTime(train.to_station_arrival)}</div>
                </div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    transform: expandedTrain === train.train_code ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    marginLeft: '10px'
                  }}
                >
                  <path d="M19 9L12 16L5 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {expandedTrain === train.train_code && (
              <div
                style={{
                  padding: '0 20px 20px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
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
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '12px',
                          padding: '15px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: 'white'
                        }}
                      >
                        <div style={{ marginBottom: '8px' }}><strong>Class:</strong> {cls.class_name}</div>
                        <div style={{ marginBottom: '8px' }}><strong>Total Seats:</strong> {cls.total_seat}</div>
                        <div style={{ marginBottom: '8px' }}><strong>Available Seats:</strong> {availableSeats}</div>
                        {cls.seat_cost !== undefined && !isNaN(parseFloat(cls.seat_cost)) && (
                          <div style={{ 
                            marginBottom: '8px',
                            color: '#ffffffff',
                            fontWeight: '600'
                          }}>
                            <strong>Price:</strong> ৳{parseFloat(cls.seat_cost).toFixed(2)}
                          </div>
                        )}
                        <div style={{ marginTop: '15px' }}>
                          {availableSeats > 0 ? (
                            <Link
                              to={`/bookseat?trainCode=${train.train_code}&className=${cls.class_name}&classCode=${cls.class_code}&date=${formatDate(dateSearched)}&from=${inputValueFrom}&to=${inputValueTo}&seat_cost=${cls.seat_cost}`}
                              style={{
                                display: 'block',
                                width: '100%',
                                padding: '10px',
                                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                color: 'white',
                                textAlign: 'center',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '500',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              Book Now
                            </Link>
                          ) : (
                            <div
                              style={{
                                display: 'block',
                                width: '100%',
                                padding: '10px',
                                background: 'rgba(255, 0, 0, 0.3)',
                                color: 'white',
                                textAlign: 'center',
                                borderRadius: '8px',
                                fontWeight: '500'
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchTravel;