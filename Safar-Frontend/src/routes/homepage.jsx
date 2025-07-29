import React from 'react';
import { FiArrowRight } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import '../components/home.css';
import Footer from '../components/Footer'; // adjust path if needed


const Homepage = () => {
  const navigate = useNavigate();

  const handleBookNowClick = async () => {
    try {
      const response = await fetch('http://localhost:5000/booking/getStations');
      if (!response.ok) throw new Error('Failed to fetch stations');

      const data = await response.json();
      localStorage.setItem('stationNames', JSON.stringify(data.stationNames));
      navigate('/booking/train/search');
    } catch (error) {
      console.error('Error fetching stations:', error);
      alert('Unable to fetch stations. Please try again later.');
    }
  };

  return (
    <div className="homepage">
      <svg viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', zIndex: -1, top: 0, left: 0, width: '100%', height: '100%' }}>
        <defs>
          {/* Gradient definitions */}
          <radialGradient id="mainBg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" style={{stopColor:'#1a1a3e', stopOpacity:1}} />
            <stop offset="50%" style={{stopColor:'#2d1b69', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#0f0f23', stopOpacity:1}} />
          </radialGradient>
          
          <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor:'#64c8ff', stopOpacity:0}} />
            <stop offset="50%" style={{stopColor:'#64c8ff', stopOpacity:0.6}} />
            <stop offset="100%" style={{stopColor:'#64c8ff', stopOpacity:0}} />
          </linearGradient>
          
          <radialGradient id="orb1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{stopColor:'#ff64c8', stopOpacity:0.8}} />
            <stop offset="100%" style={{stopColor:'#64c8ff', stopOpacity:0.8}} />
          </radialGradient>
          
          <radialGradient id="orb2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{stopColor:'#c8ff64', stopOpacity:0.8}} />
            <stop offset="100%" style={{stopColor:'#ff64c8', stopOpacity:0.8}} />
          </radialGradient>
          
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{stopColor:'#ffffff', stopOpacity:0.8}} />
            <stop offset="70%" style={{stopColor:'#64c8ff', stopOpacity:0.3}} />
            <stop offset="100%" style={{stopColor:'#64c8ff', stopOpacity:0}} />
          </radialGradient>
          
          {/* Train gradients */}
          <linearGradient id="trainGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor:'#64c8ff', stopOpacity:1}} />
            <stop offset="50%" style={{stopColor:'#ff64c8', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#c8ff64', stopOpacity:1}} />
          </linearGradient>
          
          <linearGradient id="trainGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor:'#ff64c8', stopOpacity:1}} />
            <stop offset="50%" style={{stopColor:'#c8ff64', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#64c8ff', stopOpacity:1}} />
          </linearGradient>
          
          {/* Filters for effects */}
          <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8"/>
          </filter>
          
          <filter id="glow-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur result="coloredBlur" stdDeviation="4"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="train-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Main background */}
        <rect width="1920" height="1080" fill="url(#mainBg)"/>
        
        {/* Animated flowing waves */}
        <path d="M0,400 Q480,350 960,400 T1920,400 L1920,1080 L0,1080 Z" fill="url(#wave1)" opacity="0.3">
          <animateTransform attributeName="transform" type="translate" values="0,0;100,20;0,0" dur="8s" repeatCount="indefinite"/>
        </path>
        
        <path d="M0,600 Q320,550 640,600 T1280,600 T1920,600 L1920,1080 L0,1080 Z" fill="url(#wave1)" opacity="0.2">
          <animateTransform attributeName="transform" type="translate" values="0,10;-50,-10;0,10" dur="12s" repeatCount="indefinite"/>
        </path>
        
        {/* Floating particles */}
        <g opacity="0.7">
          <circle cx="200" cy="300" r="3" fill="#64c8ff">
            <animateTransform attributeName="transform" type="translate" values="0,0;50,-100;0,0" dur="6s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0;1;0" dur="6s" repeatCount="indefinite"/>
          </circle>
          <circle cx="800" cy="200" r="2" fill="#ff64c8">
            <animateTransform attributeName="transform" type="translate" values="0,0;-30,80;0,0" dur="8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0;0.8;0" dur="8s" repeatCount="indefinite"/>
          </circle>
          <circle cx="1400" cy="400" r="4" fill="#c8ff64">
            <animateTransform attributeName="transform" type="translate" values="0,0;20,-60;0,0" dur="7s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0;1;0" dur="7s" repeatCount="indefinite"/>
          </circle>
          <circle cx="600" cy="600" r="2" fill="#ffffff">
            <animateTransform attributeName="transform" type="translate" values="0,0;-40,40;0,0" dur="5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0;0.6;0" dur="5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="1200" cy="700" r="3" fill="#ff64c8">
            <animateTransform attributeName="transform" type="translate" values="0,0;60,-20;0,0" dur="9s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0;0.9;0" dur="9s" repeatCount="indefinite"/>
          </circle>
        </g>
        
        {/* Interactive orbs */}
        <circle cx="400" cy="250" r="40" fill="url(#orb1)" filter="url(#glow-effect)">
          <animateTransform attributeName="transform" type="rotate" values="0 400 250;360 400 250" dur="20s" repeatCount="indefinite"/>
          <animate attributeName="r" values="40;50;40" dur="4s" repeatCount="indefinite"/>
        </circle>
        
        <circle cx="1400" cy="300" r="35" fill="url(#orb2)" filter="url(#glow-effect)">
          <animateTransform attributeName="transform" type="rotate" values="360 1400 300;0 1400 300" dur="25s" repeatCount="indefinite"/>
          <animate attributeName="r" values="35;45;35" dur="5s" repeatCount="indefinite"/>
        </circle>
        
        <circle cx="900" cy="800" r="30" fill="url(#orb1)" filter="url(#glow-effect)">
          <animateTransform attributeName="transform" type="rotate" values="0 900 800;360 900 800" dur="15s" repeatCount="indefinite"/>
          <animate attributeName="r" values="30;40;30" dur="3s" repeatCount="indefinite"/>
        </circle>
        
        {/* Geometric shapes */}
        <g opacity="0.4">
          <rect x="150" y="500" width="30" height="30" fill="none" stroke="#64c8ff" strokeWidth="2">
            <animateTransform attributeName="transform" type="rotate" values="0 165 515;360 165 515" dur="10s" repeatCount="indefinite"/>
          </rect>
          
          <rect x="1600" y="200" width="25" height="25" fill="none" stroke="#ff64c8" strokeWidth="2">
            <animateTransform attributeName="transform" type="rotate" values="45 1612.5 212.5;405 1612.5 212.5" dur="8s" repeatCount="indefinite"/>
          </rect>
          
          <polygon points="1200,600 1230,570 1260,600 1230,630" fill="none" stroke="#c8ff64" strokeWidth="2">
            <animateTransform attributeName="transform" type="rotate" values="0 1230 600;360 1230 600" dur="12s" repeatCount="indefinite"/>
          </polygon>
          
          <circle cx="300" cy="800" r="20" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.6">
            <animate attributeName="r" values="20;30;20" dur="6s" repeatCount="indefinite"/>
          </circle>
        </g>
        
        {/* Pulse rings */}
        <g opacity="0.5">
          <circle cx="960" cy="540" r="100" fill="none" stroke="#64c8ff" strokeWidth="2">
            <animate attributeName="r" values="50;150;50" dur="4s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;0;0.8" dur="4s" repeatCount="indefinite"/>
          </circle>
          
          <circle cx="500" cy="400" r="80" fill="none" stroke="#ff64c8" strokeWidth="1">
            <animate attributeName="r" values="40;120;40" dur="5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;0;0.6" dur="5s" repeatCount="indefinite"/>
          </circle>
        </g>
        
        {/* Glowing spots */}
        <circle cx="700" cy="300" r="150" fill="url(#glow)" opacity="0.3" filter="url(#blur)">
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="6s" repeatCount="indefinite"/>
        </circle>
        
        <circle cx="1300" cy="700" r="120" fill="url(#glow)" opacity="0.2" filter="url(#blur)">
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="8s" repeatCount="indefinite"/>
        </circle>
        
        {/* Connecting lines */}
        <g opacity="0.3" strokeWidth="1" fill="none">
          <path d="M400,250 Q700,200 1400,300" stroke="#64c8ff">
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="10s" repeatCount="indefinite"/>
          </path>
          <path d="M900,800 Q600,500 400,250" stroke="#ff64c8">
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="12s" repeatCount="indefinite"/>
          </path>
        </g>
        
        {/* ANIMATED TRAINS */}
        {/* Train tracks */}
        <rect x="0" y="180" width="1920" height="4" fill="#64c8ff" opacity="0.3"/>
        <rect x="0" y="450" width="1920" height="4" fill="#ff64c8" opacity="0.3"/>
        <rect x="0" y="900" width="1920" height="4" fill="#c8ff64" opacity="0.3"/>
        
        {/* Train 1 - Moving right on top track */}
        <g filter="url(#train-glow)">
          <g>
            <animateTransform attributeName="transform" type="translate" 
                              values="-300,0; 2220,0" dur="14s" repeatCount="indefinite"/>
            
            {/* Engine */}
            <rect x="0" y="160" width="80" height="40" rx="8" fill="url(#trainGradient1)"/>
            <rect x="65" y="150" width="20" height="20" rx="4" fill="#ffffff" opacity="0.9"/>
            <circle cx="20" cy="205" r="12" fill="#333"/>
            <circle cx="60" cy="205" r="12" fill="#333"/>
            
            {/* Car 1 */}
            <rect x="90" y="165" width="70" height="35" rx="5" fill="url(#trainGradient1)" opacity="0.9"/>
            <circle cx="105" cy="205" r="10" fill="#333"/>
            <circle cx="145" cy="205" r="10" fill="#333"/>
            
            {/* Car 2 */}
            <rect x="170" y="165" width="70" height="35" rx="5" fill="url(#trainGradient1)" opacity="0.8"/>
            <circle cx="185" cy="205" r="10" fill="#333"/>
            <circle cx="225" cy="205" r="10" fill="#333"/>
          </g>
        </g>
        
        {/* Train 2 - Moving left on middle track */}
        <g filter="url(#train-glow)">
          <g>
            <animateTransform attributeName="transform" type="translate" 
                              values="2220,0; -300,0" dur="16s" repeatCount="indefinite"/>
            
            {/* Engine (facing left) */}
            <rect x="0" y="430" width="80" height="40" rx="8" fill="url(#trainGradient2)"/>
            <rect x="0" y="420" width="20" height="20" rx="4" fill="#ffffff" opacity="0.9"/>
            <circle cx="20" cy="475" r="12" fill="#333"/>
            <circle cx="60" cy="475" r="12" fill="#333"/>
            
            {/* Car 1 */}
            <rect x="90" y="435" width="70" height="35" rx="5" fill="url(#trainGradient2)" opacity="0.9"/>
            <circle cx="105" cy="475" r="10" fill="#333"/>
            <circle cx="145" cy="475" r="10" fill="#333"/>
          </g>
        </g>
        
        {/* Train 3 - Moving right on bottom track (slower, longer) */}
        <g filter="url(#train-glow)">
          <g>
            <animateTransform attributeName="transform" type="translate" 
                              values="-400,0; 2320,0" dur="22s" repeatCount="indefinite"/>
            
            {/* Engine */}
            <rect x="0" y="880" width="90" height="45" rx="10" fill="url(#trainGradient1)"/>
            <rect x="70" y="868" width="25" height="25" rx="5" fill="#ffffff" opacity="0.9"/>
            <circle cx="22" cy="930" r="14" fill="#333"/>
            <circle cx="68" cy="930" r="14" fill="#333"/>
            
            {/* Car 1 */}
            <rect x="100" y="885" width="75" height="40" rx="6" fill="url(#trainGradient1)" opacity="0.9"/>
            <circle cx="117" cy="930" r="12" fill="#333"/>
            <circle cx="158" cy="930" r="12" fill="#333"/>
            
            {/* Car 2 */}
            <rect x="185" y="885" width="75" height="40" rx="6" fill="url(#trainGradient1)" opacity="0.8"/>
            <circle cx="202" cy="930" r="12" fill="#333"/>
            <circle cx="243" cy="930" r="12" fill="#333"/>
            
            {/* Car 3 */}
            <rect x="270" y="885" width="75" height="40" rx="6" fill="url(#trainGradient1)" opacity="0.7"/>
            <circle cx="287" cy="930" r="12" fill="#333"/>
            <circle cx="328" cy="930" r="12" fill="#333"/>
          </g>
        </g>
        
        {/* Train smoke effects */}
        <g opacity="0.4">
          <circle cx="0" cy="145" r="12" fill="#64c8ff">
            <animateTransform attributeName="transform" type="translate" 
                              values="-300,0; 2220,0" dur="14s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite"/>
            <animate attributeName="r" values="12;20;12" dur="3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="0" cy="415" r="10" fill="#ff64c8">
            <animateTransform attributeName="transform" type="translate" 
                              values="2220,0; -300,0" dur="16s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite"/>
            <animate attributeName="r" values="10;18;10" dur="2.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="0" cy="865" r="15" fill="#c8ff64">
            <animateTransform attributeName="transform" type="translate" 
                              values="-400,0; 2320,0" dur="22s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.4;0;0.4" dur="4s" repeatCount="indefinite"/>
            <animate attributeName="r" values="15;25;15" dur="4s" repeatCount="indefinite"/>
          </circle>
        </g>
        
        {/* Additional atmospheric effects */}
        <rect x="0" y="0" width="1920" height="1080" fill="url(#mainBg)" opacity="0.1"/>
      </svg>
      <div className="homepage-content">
        <h1 className="primary-heading">Safar Khoobsurat hain manzil se bhi!</h1>
        <p className="primary-text">
          Let us help you find the best train tickets for your next trip. At the cheapest you can find!
        </p>
        <button className="secondary-button" onClick={handleBookNowClick}>
          Book Now <FiArrowRight />
        </button>
      </div>
    </div>
  );
}

export default Homepage;