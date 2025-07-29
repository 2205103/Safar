import React, { Fragment, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from './utils';

function AddUser() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    username: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Mobile number is required';
    } else if (!/^\d{11}$/.test(formData.phone_number.replace(/\s+/g, ''))) {
      newErrors.phone_number = 'Mobile number must be exactly 11 digits';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const body = { 
        name: formData.name,
        phone_number: formData.phone_number,
        username: formData.username,
        password: formData.password
      };
      
      const response = await fetchWithAuth("http://localhost:5000/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }, navigate);

      if (response.status === 201) {
        setMessage("Account created successfully!");
      } else {
        const data = await response.json();
        setMessage(data.error || "Something went wrong.");
      }

      setShowMessage(true);
    } catch (err) {
      console.error(err.message);
      setMessage("Network error.");
      setShowMessage(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeMessage = () => {
    setShowMessage(false);
    if (message === "Account created successfully!") {
      navigate('/users/login');
    }
  };

  // Auto-dismiss popup after 3 seconds
  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(closeMessage, 1500);
      return () => clearTimeout(timer);
    }
  }, [showMessage]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0e360e 0%, #166534 50%, #22c55e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6rem 1rem 2rem 1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                          radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`,
        animation: 'float 6s ease-in-out infinite'
      }}></div>

      {/* Main Form Container */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        zIndex: 1,
        animation: 'slideUp 0.8s ease-out',
        marginTop: '30px'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(45deg, #0e360e, #166534)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 30px rgba(14, 54, 14, 0.3)'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <h1 style={{
            color: '#0e360e',
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            lineHeight: 1.2
          }}>Create Account</h1>
          <p style={{
            color: '#6b7280',
            fontSize: '1rem',
            lineHeight: 1.5
          }}>Join us and start your journey today</p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmitForm} style={{ width: '100%' }}>
          
          {/* Full Name Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              color: '#0e360e',
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                border: errors.name ? '2px solid #ef4444' : '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                background: 'white'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0e360e';
                e.target.style.boxShadow = '0 0 0 3px rgba(14, 54, 14, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.name ? '#ef4444' : '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.8rem',
                marginTop: '0.3rem',
                marginLeft: '0.2rem'
              }}>{errors.name}</p>
            )}
          </div>

          {/* Mobile Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              color: '#0e360e',
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Mobile Number *
            </label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              maxLength="11"
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                border: errors.phone_number ? '2px solid #ef4444' : '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                background: 'white'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0e360e';
                e.target.style.boxShadow = '0 0 0 3px rgba(14, 54, 14, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.phone_number ? '#ef4444' : '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Enter your 11-digit mobile number"
            />
            {errors.phone_number && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.8rem',
                marginTop: '0.3rem',
                marginLeft: '0.2rem'
              }}>{errors.phone_number}</p>
            )}
          </div>

          {/* Username Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              color: '#0e360e',
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                border: errors.username ? '2px solid #ef4444' : '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                background: 'white'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0e360e';
                e.target.style.boxShadow = '0 0 0 3px rgba(14, 54, 14, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.username ? '#ef4444' : '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Choose a username"
            />
            {errors.username && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.8rem',
                marginTop: '0.3rem',
                marginLeft: '0.2rem'
              }}>{errors.username}</p>
            )}
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              color: '#0e360e',
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.8rem 3rem 0.8rem 1rem',
                  border: errors.password ? '2px solid #ef4444' : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0e360e';
                  e.target.style.boxShadow = '0 0 0 3px rgba(14, 54, 14, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.password ? '#ef4444' : '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.8rem',
                marginTop: '0.3rem',
                marginLeft: '0.2rem'
              }}>{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              background: isSubmitting 
                ? '#9ca3af' 
                : 'linear-gradient(45deg, #0e360e, #166534)',
              color: 'white',
              padding: '1rem',
              borderRadius: '12px',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(14, 54, 14, 0.3)',
              marginBottom: '1.5rem',
              opacity: isSubmitting ? 0.8 : 1
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(14, 54, 14, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(14, 54, 14, 0.3)';
              }
            }}
          >
            {isSubmitting ? (
              <>
                <svg style={{
                  width: '20px',
                  height: '20px',
                  marginRight: '8px',
                  animation: 'spin 1s linear infinite',
                  display: 'inline-block',
                  verticalAlign: 'middle'
                }} viewBox="0 0 24 24" fill="white">
                  <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
                </svg>
                Processing...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Login Link */}
          <p style={{
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '0.9rem'
          }}>
            Already have an account?{' '}
            <button 
              type="button"
              onClick={() => navigate('/users/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#0e360e',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'color 0.3s ease',
                cursor: 'pointer',
                padding: 0,
                fontSize: 'inherit'
              }}
              onMouseEnter={(e) => e.target.style.color = '#166534'}
              onMouseLeave={(e) => e.target.style.color = '#0e360e'}
            >
              Sign In
            </button>
          </p>
        </form>
      </div>

      {/* Success/Error Notification */}
      {showMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: message.includes("successfully") ? '#f0fdf4' : '#fef2f2',
          color: message.includes("successfully") ? '#166534' : '#991b1b',
          border: `1px solid ${message.includes("successfully") ? '#86efac' : '#fca5a5'}`,
          borderRadius: '12px',
          padding: '16px',
          zIndex: 1000,
          width: '320px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'flex-start',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{
            marginRight: '12px',
            flexShrink: 0,
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: message.includes("successfully") ? '#22c55e' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            {message.includes("successfully") ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px'
            }}>
              <strong style={{ fontSize: '1rem' }}>{message.includes("successfully") ? "Success" : "Error"}</strong>
              <button 
                onClick={closeMessage}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  padding: '4px',
                  marginLeft: '8px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>{message}</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        input::placeholder {
          color: #9ca3af;
        }

        @media (max-width: 480px) {
          .register-container {
            padding: 2rem 1.5rem !important;
            margin: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default AddUser;