import React, { createContext, useState, useContext, useEffect } from 'react';


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

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const ID= localStorage.getItem("userId");
      const NAME= localStorage.getItem("name");
      setUserId(ID); 
      setName(NAME); 
      setLoginState(true);
    }
  }, []);


  return (
    <AppContext.Provider value=
    {{
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
      setRoute
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useData = () => useContext(AppContext);
