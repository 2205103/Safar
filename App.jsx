import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from './routes/homepage';
import About from './components/About.jsx';
import LoginPage from './routes/loginPage';
import UpdateUserInfo from './routes/updateUserInfo';
import ShowUserInfo from './routes/ShowUserInfo.jsx';
import AddUserInfo from './routes/addUserInfo';
import SearchUserInfo from './routes/searchUserInfo';
import RouteDetails from './routes/routeDetails';
import SearchTrainInfo from './routes/searchTrainInfo';
import ReviewPage from './routes/reviewPage';
import BookTrain from './routes/bookTrain';
import BookSeat from './routes/bookSeat';
import TicketBooking from './routes/ticketBooking';
import TicketHistory from './routes/ticketHistory';
import AdminPage from './routes/adminPage';
import TrainInformation from './routes/trainInfo';

import NavBar from './components/NavBar';
import './components/App.css';
import Footer from './components/Footer.jsx';
import { AppProvider } from './components/AppContext';

const AppContent = ({ isAuthenticated, name1, id1, setAuth }) => {
  const location = useLocation();

  return (
    <>
      <NavBar isAuthenticated={isAuthenticated} name1={name1} id1={id1} />
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/trainInfo" element={<TrainInformation />} />
          <Route path="/users/login" element={<LoginPage setAuth={setAuth} />} />
          <Route path="/users/:id/update" element={<UpdateUserInfo />} />
          <Route path="/users/:id" element={<ShowUserInfo />} />
          <Route path="/users/:id/tickets" element={<TicketHistory />} />
          <Route path="/users" element={<AddUserInfo />} />
          <Route path="/search" element={<SearchUserInfo />} />
          <Route path="/trains" element={<SearchTrainInfo />} />
          <Route path="/train/:id" element={<RouteDetails />} />
          <Route path="/booking/train/search" element={<BookTrain />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/bookseat" element={<BookSeat />} />
          <Route path="/booking/ticket" element={<TicketBooking />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
      <Footer/>
    </>
  );
};

const App = () => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [name1, setName1] = useState(null);
  const [id1, setId1] = useState(null);

  const setAuth = (boolean) => {
    setAuthenticated(boolean);
    setName1(localStorage.getItem("name"));
    setId1(localStorage.getItem("userId"));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // You can add token expiration check here if you want
      setAuth(true);
    } else {
      setAuth(false);
    }
  }, []);

  return (
    <div className="App">
      <AppProvider>
        <AppContent isAuthenticated={isAuthenticated} name1={name1} id1={id1} setAuth={setAuth} />
      </AppProvider>
    </div>
  );
};

export default App;