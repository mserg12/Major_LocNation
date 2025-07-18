import { useState } from "react";
import "./slider.scss"; // Import SCSS file for styling

function Slider({ images }) {
  const [imageIndex, setImageIndex] = useState(null); // State to track current image index in full-screen mode

  // Function to navigate between images
  const changeSlide = (direction) => {
    if (direction === "left") {
      // If at the first image, go to the last image
      setImageIndex(imageIndex === 0 ? images.length - 1 : imageIndex - 1);
    } else {
      // If at the last image, go back to the first image
      setImageIndex(imageIndex === images.length - 1 ? 0 : imageIndex + 1);
    }
  };

  return (
    <div className="slider">
      {/* Fullscreen Image Viewer */}
      {imageIndex !== null && (
        <div className="fullSlider">
          {/* Left arrow for previous image */}
          <div className="arrow" onClick={() => changeSlide("left")}>
            <img src="/arrow.png" alt="Previous" />
          </div>

          {/* Image Display Container */}
          <div className="imgContainer">
            <img src={images[imageIndex]} alt="Full Screen" />
          </div>

          {/* Right arrow for next image */}
          <div className="arrow" onClick={() => changeSlide("right")}>
            <img src="/arrow.png" className="right" alt="Next" />
          </div>

          {/* Close button to exit fullscreen mode */}
          <div className="close" onClick={() => setImageIndex(null)}>
            X
          </div>
        </div>
      )}

      {/* Main Image (First Image) */}
      <div className="bigImage">
        <img src={images[0]} alt="Main" onClick={() => setImageIndex(0)} />
      </div>

      {/* Thumbnail Images (All except the first one) */}
      <div className="smallImages">
        {images.slice(1).map((image, index) => (
          <img
            src={image}
            alt="Thumbnail"
            key={index}
            onClick={() => setImageIndex(index + 1)} // Open selected image in fullscreen
          />
        ))}
      </div>
    </div>
  );
}

export default Slider;
