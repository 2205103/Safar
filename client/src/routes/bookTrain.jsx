//done

import React from 'react'
import SearchTravel from '../components/SearchTravel'
import '../components/App.css'
const bookTrain = () => {
  return (
    <div>
      {/* <center><h1 className="header-title">
        Seach for a train
      </h1></center> */}
      
      <SearchTravel />
      <div className="home-banner-container">
      
       <div className="home-bannerImage-container">
          <img src='home-banner-background.png' alt="" />
      </div>
      </div>
    </div>
  )
}


export default bookTrain