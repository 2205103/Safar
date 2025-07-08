
import { Link } from 'react-router-dom';
import './hp.css';
import { BsFillPersonFill } from "react-icons/bs";
import NavBar from './NavBar'
import NavBar2 from './NavBar2'
import React, { useState, useEffect, Fragment } from 'react';

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import './home.css';

const HomePage = () => {
   
    const reloadPage = () =>{
        window.location.reload();
    }

   
    


    // return (
    //     <div>
    //         <header className="header">
    //             <img src="../../siren_home.png" style={{ width: '100px', height: '30px', marginLeft: '10px' }} />

    //             <nav>
    //                 <Link to="users/login">Login</Link>
    //                 <Link to="/trains">Train Information</Link>
    //                 <Link to="/booking/train/search">Book a SEAT!</Link>
    //             </nav>
    //         </header>
    //         <main className="main">
    //             {/* Main content goes here */}
    //         </main>
    //         <footer className="footer">
    //             {/* Footer content if any */}
    //         </footer>
    //     </div>
    // );

    // const [isAuthenticated, setAuthenticated] = useState(false);

    // useEffect(() => {
    //     const isAuth = async () => {
    //         try {
    //             const response = await fetch("http://localhost:3001/is-verify", {
    //                 method: "GET",
    //                 headers: { jwt_token: localStorage.getItem("token") }
    //             });
    //             const parseRes = await response.json();
    //             setAuthenticated(parseRes === true);
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     };
    
    //     isAuth();
    // }, []); 

    
      
    return <Fragment>
       
         {/*isAuthenticated ? <NavBar2 /> : <NavBar />}
       {/* <div className="sidebar">
            <header className="header">
                <div className="logo">
                    < src="../../siren_home.png" style={{ width: '150px', height: '50px', marginLeft: '10px' }} />
                </div>
            </header>
            <nav className="nav">
                <ul>
                    <li>
                        <Link to="users/login">Login</Link>
                    </li>
                    <li>
                        <Link to="/trains">Train Information</Link>
                    </li>
                    <li>
                        <Link to="/booking/train/search">Book a SEAT!</Link>
                    </li>
                </ul>
            </nav>
            <main className="main">
                {Main content goes here }
            </main>
            <footer className="footer">
                { Footer content if any }
            </footer>
        </div>
        <div className="icon">
            { <Link to={`http://localhost:3001/users/${id}`}> *}
                <BsFillPersonFill />
            { </Link> }
        </div>*/}
    </Fragment>
};

export default HomePage;
