import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext"; // Import AuthContext for authentication
import SearchBar from "../../components/searchBar/SearchBar"; // Import SearchBar component
import "./homePage.scss"; // Import SCSS file for styling

function HomePage() {
  const { currentUser } = useContext(AuthContext); // Access the current authenticated user

  console.log(currentUser); // Log user info for debugging

  return (
    <div className="homePage">
      {/* Left Section - Text & Search */}
      <div className="textContainer">
        <div className="wrapper">
          <h1 className="title">Find Affordable Drehorten</h1> 
          {/* Main Heading */}

          <p>
            Discover affordable filming locations perfect for young creators,
            aspiring filmmakers, and low-budget projects. Whether you're
            shooting a video or a film, find the ideal spot that fits your
            budget and inspires your creativity.
          </p>
          {/* Description Text */}

          <SearchBar /> 
          {/* Search Bar Component */}

          {/* Informational Boxes */}
          <div className="boxes">
            <div className="box">
              <h1>Explore</h1>
              <h2>Unique Locations</h2>
            </div>
            <div className="box">
              <h1>Affordable</h1>
              <h2>Filming Spots</h2>
            </div>
            <div className="box">
              <h1>Inspire</h1>
              <h2>Your Creativity</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Image Container */}
      <div className="imgContainer">
        {/* Add an image here if needed */}
      </div>
    </div>
  );
}

export default HomePage;
