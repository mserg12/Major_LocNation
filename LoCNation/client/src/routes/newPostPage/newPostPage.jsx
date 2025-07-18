import { useState } from "react";
import "./newPostPage.scss";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import apiRequest from "../../lib/apiRequest";
import UploadWidget from "../../components/uploadWidget/UploadWidget";
import { useNavigate } from "react-router-dom";

function NewPostPage() {
  const [value, setValue] = useState(""); // Description field
  const [images, setImages] = useState([]); // Uploaded images
  const [error, setError] = useState(""); // Error message state
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for submission
  const [formData, setFormData] = useState({
    hasFilmingPermit: false,
    hasStudio: false,
    hasPower: false,
    availableParking: false,
    crewSize: 0,
  });

  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error messages
    setIsSubmitting(true); // Set loading state

    // Get form data from state (which includes checkbox states)
    const inputs = {
      ...Object.fromEntries(new FormData(e.target)),
      hasFilmingPermit: formData.hasFilmingPermit,
      hasStudio: formData.hasStudio,
      hasPower: formData.hasPower,
      availableParking: formData.availableParking,
      crewSize: formData.crewSize
    };

    // Basic Form Validation
    if (!inputs.title || !inputs.price || !inputs.address || !inputs.city) {
      setError("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const postData = {
        postData: {
          title: inputs.title,
          price: parseInt(inputs.price) || 0,
          address: inputs.address,
          city: inputs.city,
          bedroom: parseInt(inputs.bedroom) || 0,
          bathroom: parseInt(inputs.bathroom) || 0,
          type: inputs.type,
          property: inputs.property,
          locationType: inputs.locationType || null,
          genre: inputs.genre || null,
          latitude: inputs.latitude || null,
          longitude: inputs.longitude || null,
          images: images,
        },
        postDetail: {
          desc: value,
          utilities: inputs.utilities || null,
          pet: inputs.pet || null,
          income: inputs.income || null,
          size: inputs.size ? parseInt(inputs.size) : null,
          school: inputs.school ? parseInt(inputs.school) : null,
          bus: inputs.bus ? parseInt(inputs.bus) : null,
          restaurant: inputs.restaurant ? parseInt(inputs.restaurant) : null,
          hasFilmingPermit: inputs.hasFilmingPermit || false,
          hasStudio: inputs.hasStudio || false,
          hasPower: inputs.hasPower || false,
          availableParking: inputs.availableParking || false,
          crewSize: inputs.crewSize ? parseInt(inputs.crewSize) : null,
        },
      };

      console.log('Submitting post data:', JSON.stringify(postData, null, 2));
      const res = await apiRequest.post("/posts", postData);

      navigate("/" + res.data.id); // Redirect to the new post
    } catch (err) {
      console.error("Error creating post:", err);
      setError(err.response?.data?.message || "Failed to create post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="newPostPage">
      <div className="formContainer">
        <h1>Add New Post</h1>
        <div className="wrapper">
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="item">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" type="text" required />
            </div>

            {/* Price */}
            <div className="item">
              <label htmlFor="price">Price</label>
              <input id="price" name="price" type="number" required />
            </div>

            {/* Address */}
            <div className="item">
              <label htmlFor="address">Address</label>
              <input id="address" name="address" type="text" required />
            </div>

            {/* Description */}
            <div className="item description">
              <label htmlFor="desc">Description</label>
              <ReactQuill theme="snow" onChange={setValue} value={value} />
            </div>

            {/* City */}
            <div className="item">
              <label htmlFor="city">City</label>
              <input id="city" name="city" type="text" required />
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="item">
              <label htmlFor="bedroom">Bedroom Number</label>
              <input id="bedroom" name="bedroom" type="number" min={1} required />
            </div>
            <div className="item">
              <label htmlFor="bathroom">Bathroom Number</label>
              <input id="bathroom" name="bathroom" type="number" min={1} required />
            </div>

            {/* Latitude & Longitude */}
            <div className="item">
              <label htmlFor="latitude">Latitude</label>
              <input id="latitude" name="latitude" type="text" required />
            </div>
            <div className="item">
              <label htmlFor="longitude">Longitude</label>
              <input id="longitude" name="longitude" type="text" required />
            </div>

            {/* Type & Property Selection */}
            <div className="item">
              <label htmlFor="type">Type</label>
              <select name="type" required>
                <option value="rent">Rent</option>
              </select>
            </div>
            <div className="item">
              <label htmlFor="property">Property</label>
              <select name="property" required>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="land">Land</option>
              </select>
            </div>

            <div className="item">
              <label htmlFor="locationType">Location Type</label>
              <select name="locationType" id="locationType" required>
                <option value="">Select location type</option>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
              </select>
            </div>

            {/* Genre */}
            <div className="item">
              <label htmlFor="genre">Genre</label>
              <select name="genre" id="genre" required>
                <option value="">Select genre</option>
                <option value="Action">Action</option>
                <option value="Horror">Horror</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Romance">Romance</option>
                <option value="Historical">Historical</option>
                <option value="Drama">Drama</option>
                <option value="Fantasy">Fantasy</option>
              </select>
            </div>

            {/* Additional Fields */}
           
            <div className="item">
              <label htmlFor="pet">Pet Policy</label>
              <select name="pet">
                <option value="allowed">Allowed</option>
                <option value="not-allowed">Not Allowed</option>
              </select>
            </div>
            
            <div className="item">
              <label htmlFor="size">Total Size </label>
              <input id="size" name="size" type="number" min={0} required />
            </div>
            <div className="item">
              <label htmlFor="bus">Bus</label>
              <input id="bus" name="bus" type="number" min={0} />
            </div>
            <div className="item">
              <label htmlFor="restaurant">Restaurant</label>
              <input id="restaurant" name="restaurant" type="number" min={0} />
            </div>

            {/* New Filter Fields */}
            <div className="item checkbox-group">
              <label>Facilities</label>
              <div className="checkbox-container">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={formData.hasFilmingPermit}
                    onChange={(e) => setFormData({...formData, hasFilmingPermit: e.target.checked})}
                  />
                  Has Filming Permit
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={formData.hasStudio}
                    onChange={(e) => setFormData({...formData, hasStudio: e.target.checked})}
                  />
                  Has Studio
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={formData.hasPower}
                    onChange={(e) => setFormData({...formData, hasPower: e.target.checked})}
                  />
                  Has Power Supply
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={formData.availableParking}
                    onChange={(e) => setFormData({...formData, availableParking: e.target.checked})}
                  />
                  Available Parking
                </label>
              </div>
            </div>

            <div className="item">
              <label htmlFor="crewSize">Minimum Crew Size</label>
              <input 
                id="crewSize" 
                name="crewSize" 
                type="number" 
                min="0"
                value={formData.crewSize}
                onChange={(e) => setFormData({...formData, crewSize: e.target.value})}
              />
            </div>

            {/* Submit Button */}
            <button className="sendButton" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add"}
            </button>

            {/* Error Message Display */}
            {error && <span className="error">{error}</span>}
          </form>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="sideContainer">
        {images.map((image, index) => (
          <img src={image} key={index} alt={`Uploaded-${index}`} />
        ))}
        <UploadWidget
          uwConfig={{
            multiple: true,
            cloudName: "dqgbu8jsc",
            uploadPreset: "LocNation",
            folder: "posts",
          }}
          setState={setImages}
        />
      </div>
    </div>
  );
}

export default NewPostPage;
