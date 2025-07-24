import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './comp.css';
import { fetchWithAuth } from './utils';

const SearchTrain = () => {
  const navigate = useNavigate();
  const [trainName, setTrainName] = useState('');
  const [trainOptions, setTrainOptions] = useState([]);
  const [trainData, setTrainData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Load train names from localStorage on mount
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
      const res = await fetchWithAuth('http://localhost:5000/booking/trainDetails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ train_name: trimmed }),
      }, navigate);

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
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Background animations */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 1
      }}>
        {/* Floating shapes */}
        <div style={{
          position: 'absolute',
          width: '80px',
          height: '80px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite',
          top: '20%',
          left: '10%'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '120px',
          height: '120px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite 2s',
          top: '60%',
          right: '15%'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '60px',
          height: '60px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite 4s',
          top: '40%',
          left: '70%'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '90px',
          height: '90px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20%',
          animation: 'float 6s ease-in-out infinite 1s',
          top: '80%',
          left: '30%'
        }}></div>
        
        {/* Gradient orbs */}
        <div style={{
          position: 'absolute',
          borderRadius: '50%',
          filter: 'blur(60px)',
          opacity: 0.7,
          animation: 'pulse 4s ease-in-out infinite',
          top: '15%',
          right: '20%',
          width: '300px',
          height: '300px',
          background: 'linear-gradient(45deg, #ff6b6b, #ffd93d)'
        }}></div>
        <div style={{
          position: 'absolute',
          borderRadius: '50%',
          filter: 'blur(60px)',
          opacity: 0.7,
          animation: 'pulse 4s ease-in-out infinite 2s',
          bottom: '20%',
          left: '10%',
          width: '250px',
          height: '250px',
          background: 'linear-gradient(45deg, #6c5ce7, #74b9ff)'
        }}></div>
        <div style={{
          position: 'absolute',
          borderRadius: '50%',
          filter: 'blur(60px)',
          opacity: 0.7,
          animation: 'pulse 4s ease-in-out infinite 1s',
          top: '50%',
          right: '5%',
          width: '200px',
          height: '200px',
          background: 'linear-gradient(45deg, #a29bfe, #fd79a8)'
        }}></div>
      </div>

      {/* Main container */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '24px',
          padding: '3rem',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
          width: '100%',
          maxWidth: '600px',
          textAlign: 'center',
          animation: 'slideUp 0.8s ease-out'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #fff, #e3f2fd)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '2rem',
            textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            animation: 'glow 2s ease-in-out infinite alternate'
          }}>Train Search</h1>
          
          <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: '2rem' }}>
            <select
              style={{
                width: '100%',
                padding: '1.2rem 1.5rem',
                border: 'none',
                borderRadius: '50px',
                background: 'rgba(83, 69, 143, 0.9)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                fontSize: '1.1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.1)',
                appearance: 'none',
                textAlign: 'center'
              }}
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

            <button 
              type="submit" 
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </button>
          </form>

          {isLoading && (
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '2rem',
              animation: 'fadeIn 1s ease-out forwards'
            }}>Searching for trains...</p>
          )}

          {error && (
            <p style={{ 
              color: 'rgba(255, 100, 100, 0.9)',
              marginBottom: '2rem',
              animation: 'fadeIn 1s ease-out forwards'
            }}>{error}</p>
          )}

          {!isLoading && hasSearched && !trainData && !error && (
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '2rem',
              animation: 'fadeIn 1s ease-out forwards'
            }}>No train found.</p>
          )}

          <p style={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1.1rem',
            marginTop: '1rem',
            animation: 'fadeIn 1s ease-out 0.5s forwards',
            opacity: 0
          }}>Discover trains, explore destinations</p>
        </div>

        {/* Results container */}
        {trainData && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
            width: '100%',
            maxWidth: '800px',
            marginTop: '2rem',
            animation: 'slideUp 0.8s ease-out'
          }}>
            {['UP', 'DOWN'].map((dir) => (
              trainData[dir] && (
                <div key={dir} style={{ marginBottom: '40px' }}>
                  <h3 style={{ 
                    textAlign: 'center',
                    color: 'white',
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #fff, #e3f2fd)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {trainData[dir].train_name} ({trainData[dir].train_code}) - {dir} Direction
                  </h3>
                  <p style={{ 
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '1.5rem'
                  }}>
                    <strong>Direction:</strong> {trainData[dir].route_name}
                  </p>

                  <h4 style={{ 
                    marginTop: '20px',
                    textAlign: 'center',
                    color: 'white',
                    marginBottom: '1.5rem'
                  }}>Timetable:</h4>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    {trainData[dir].timetable.map((row, idx) => (
                      <div key={idx} style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '1rem',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '1rem',
                          color: 'white'
                        }}>
                          <div>
                            <p><strong>Current Station:</strong> {row.from_station}</p>
                            <p><strong>Arrival:</strong> {row.arrival_time}</p>
                          </div>
                          <div>
                            <p><strong>Departure:</strong> {row.departure_time}</p>
                            <p><strong>Next Station:</strong> {row.to_station}</p>
                          </div>
                        </div>
                        <p style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          textAlign: 'center',
                          marginTop: '0.5rem'
                        }}>
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
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 0.9; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes glow {
          from { text-shadow: 0 0 20px rgba(255, 255, 255, 0.5); }
          to { text-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.6); }
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SearchTrain;