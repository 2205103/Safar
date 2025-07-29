import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './reviewPg.css';
import { fetchWithAuth } from './utils';
import './reviewPg.css';

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0 ? 1 : 0; 
  const emptyStars = 5 - fullStars - halfStar;
  
  return (
    <>
      {'★'.repeat(fullStars)}
      {'☆'.repeat(emptyStars)}
    </>
  );
};

const Review = () => {
  const [reviews, setReviews] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const trainID = searchParams.get('trainId');
    const classType = searchParams.get('classId');
    
    const fetchData = async () => {
      try {
        const trainQueryParam = encodeURIComponent(trainID);
        const classTypeQueryParam = encodeURIComponent(classType);
        
        const url = `http://localhost:3001/review?trainID=${trainQueryParam}&classType=${classTypeQueryParam}`;
        
        const response = await fetchWithAuth(url, {}, navigate);
        const data = await response.json();

        setReviews(data.result); 
      } catch (error) {
        console.error(error.message);
      }
    };
    
    if (trainID && classType) {
      fetchData();
    }
  }, [location.search]);

  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr>
            <th>Name</th>
            <th>Review</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review, index) => (
            <tr key={index}>
              <td>{review.first_name} {review.last_name}</td>
              <td>{review.review_content}</td>
              <td><StarRating rating={review.rating} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Review;
