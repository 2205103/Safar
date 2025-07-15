import React, { useState, useEffect } from 'react';
import './comp.css';

const SearchTrain = () => {
  const [trainName, setTrainName] = useState('');
  const [trainOptions, setTrainOptions] = useState([]);
  const [trainData, setTrainData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // 🔁 Load train names from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('train_names');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setTrainOptions(parsed);
        }
      } catch (e) {
        console.error('Error parsing train_names from localStorage:', e);
      }
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = trainName.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError('');
    setTrainData(null);
    setHasSearched(true);

    try {
      const res = await fetch('http://localhost:5000/booking/trainDetails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ train_name: trimmed }),
      });

      const data = await res.json();

      if (!res.ok || !data || data.success === false) {
        throw new Error(data.error || 'Train not found');
      }

      setTrainData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-container">
      <form className="search" onSubmit={handleSearch}>
        <h2 className="header-title">Select Your Preferred Train:</h2>

        {/* 🚆 Dropdown for train names */}
        <select
          className="search-bar"
          value={trainName}
          onChange={(e) => setTrainName(e.target.value)}
        >
          <option value="">-- Select a train --</option>
          {trainOptions.map((name, idx) => (
            <option key={idx} value={name}>
              {name}
            </option>
          ))}
        </select>

        <button type="submit" className="button">Search</button>

        {isLoading && <p style={{ marginTop: '20px' }}>Loading...</p>}
        {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}
        {!isLoading && hasSearched && !trainData && !error && (
          <p style={{ marginTop: '20px' }}>No train found.</p>
        )}

        {trainData && (
          <div style={{ marginTop: '30px', width: '100%' }}>
            {['UP', 'DOWN'].map((dir) => (
              trainData[dir] && (
                <div key={dir} style={{ marginBottom: '40px' }}>
                  <h3 style={{ textAlign: 'center' }}>
                    {trainData[dir].train_name} ({trainData[dir].train_code}) - {dir} Direction
                  </h3>
                  <p style={{ textAlign: 'center' }}>
                    <strong>Direction:</strong> {trainData[dir].route_name}
                  </p>

                  <h4 style={{ marginTop: '20px', textAlign: 'center' }}>Timetable:</h4>
                  <div className="vertical-timetable">
                    {trainData[dir].timetable.map((row, idx) => (
                      <div key={idx} className="timetable-block">
                        <div className="timetable-box">
                          <p><strong>Current Station:</strong> {row.from_station}</p>
                          <p><strong>Arrival:</strong> {row.arrival_time}</p>
                          <p><strong>Departure:</strong> {row.departure_time}</p>
                          <p><strong>Next Station:</strong> {row.to_station}</p>
                        </div>
                        <p className="duration-line">
                          <strong>Time to Reach next Stoppage:</strong> {row.duration}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchTrain;
