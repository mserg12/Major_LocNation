import { Marker, Popup } from "react-leaflet"; // Import Marker and Popup from react-leaflet
import "./pin.scss"; // Import SCSS file for styling
import { Link } from "react-router-dom"; // Import Link for navigation

function Pin({ item }) {
  return (
    <Marker position={[item.latitude, item.longitude]}> 
      {/* Position the marker on the map using latitude & longitude */}
      
      <Popup>
        {/* Popup content displayed when clicking on the marker */}
        <div className="popupContainer">
          <img src={item.img} alt={item.title} /> 
          {/* Display property image */}
          
          <div className="textContainer">
            <Link to={`/${item.id}`}>{item.title}</Link> 
            {/* Link to property details page */}
            
            <span>{item.bedroom} bedroom</span> 
            {/* Display number of bedrooms */}
            
            <b>$ {item.price}</b> 
            {/* Display price of the property */}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default Pin; 
