import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [name, setName] = useState(null);
  const [loginState, setLoginState] = useState(false);
  const [fromStationSearch, setFromStationSearch] = useState(null);
  const [toStationSearch, setToStationSearch] = useState(null);
  const [dates, setDates] = useState(null);
  const [route, setRoute] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const ID = localStorage.getItem("userId");
      const NAME = localStorage.getItem("name");
      setUserId(ID);
      setName(NAME);
      setLoginState(true);
      setToken(storedToken);
    }
  }, []);

  // ✅ Logout function shared via context
  const logOut = () => {
    setUserId(null);
    setName(null);
    setToken(null);
    setLoginState(false);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <AppContext.Provider value={{
      userId,
      setUserId,
      token,
      setToken,
      name,
      setName,
      loginState,
      setLoginState,
      fromStationSearch,
      setFromStationSearch,
      toStationSearch,
      setToStationSearch,
      dates,
      setDates,
      route,
      setRoute,
      logOut, // 👈 make logOut available
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useData = () => useContext(AppContext);
