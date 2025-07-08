import React from "react";
// import AboutBackground from "../Assets/about-background.png";
// import AboutBackgroundImage from "../Assets/about-background-image.png";
import { BsFillPlayCircleFill } from "react-icons/bs";

const About = () => {
  return (
    <div className="about-section-container">
      <div className="about-background-image-container">
        <img src={'about-background.png'} alt="" />
      </div>

      <div className="about-section-text-container">
        <p className="primary-subheading" style={{ color: '#0e360e' }}>About</p>
        <h1 className="primary-heading">
          Exploring the World by Rail
        </h1>
        <p className="primary-text">
          Traveling by train offers a unique and immersive experience, allowing you to journey through diverse landscapes and cultures. From bustling cities to picturesque countryside, trains offer a window into the heart of every destination.
        </p>
        <p className="primary-text">
          Discover the joy of slow travel, where the journey itself becomes an adventure. Whether it's the rhythmic clacking of wheels on the tracks or the panoramic views unfolding outside your window, every moment on a train is filled with anticipation and discovery.
        </p>

        <div className="about-buttons-container">
          <button className="secondary-button2">Learn More</button>
          <button className="watch-video-button">
          <a href="https://www.youtube.com/watch?v=_BXmqEwgEk8&list=RDa_XQdhxeZ10&index=2" style={{textDecoration:'none'}}>
            <BsFillPlayCircleFill /> Watch Video </a>
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;