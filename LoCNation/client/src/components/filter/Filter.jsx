import { useState, useEffect } from "react";
import "./filter.scss";
import { useSearchParams, useLocation } from "react-router-dom"; // Hooks for managing URL and navigation

function Filter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  // Initialize state from URL parameters
  const [query, setQuery] = useState(() => ({
    // Basic filters
    type: searchParams.get("type") || "",
    city: searchParams.get("city") || "",
    property: searchParams.get("property") || "",
    locationType: searchParams.get("locationType") || "",
    genre: searchParams.get("genre") || "",
    bedroom: searchParams.get("bedroom") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    
    // Size filters
    minSize: searchParams.get("minSize") || "",
    maxSize: searchParams.get("maxSize") || "",
    
    // Crew size
    crewSize: searchParams.get("crewSize") || "",
    
    // Boolean filters - use hasFilmingPermit to match backend
    hasFilmingPermit: searchParams.get("hasFilmingPermit") === "true" || false,
    hasStudio: searchParams.get("hasStudio") === "true" || false,
    hasPower: searchParams.get("hasPower") === "true" || false,
    availableParking: searchParams.get("availableParking") === "true" || false,
  }));
  
  // Update state when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(prev => ({
      ...prev,
      type: params.get("type") || "",
      city: params.get("city") || "",
      property: params.get("property") || "",
      locationType: params.get("locationType") || "",
      genre: params.get("genre") || "",
      bedroom: params.get("bedroom") || "",
      minPrice: params.get("minPrice") || "",
      maxPrice: params.get("maxPrice") || "",
      minSize: params.get("minSize") || "",
      maxSize: params.get("maxSize") || "",
      crewSize: params.get("crewSize") || "",
      // Use hasFilmingPermit to match backend
      hasFilmingPermit: params.get("hasFilmingPermit") === "true" || false,
      hasStudio: params.get("hasStudio") === "true" || false,
      hasPower: params.get("hasPower") === "true" || false,
      availableParking: params.get("availableParking") === "true" || false,
    }));
  }, [location.search]);

  // Handle input changes for text/number/select inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setQuery(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));  
  };

  // Update URL search parameters when filtering
  const handleFilter = () => {
    const params = new URLSearchParams();
    
    // List of all filter fields
    const filterFields = [
      // Basic filters
      'type', 'city', 'property', 'locationType', 'genre', 'bedroom',
      'minPrice', 'maxPrice', 'minSize', 'maxSize', 'crewSize',
      // Boolean filters
      'hasFilmingPermit', 'hasStudio', 'hasPower', 'availableParking'
    ];
    
    // Add each filter to params if it has a value
    filterFields.forEach(field => {
      const value = query[field];
      
      // Skip empty strings, undefined, null, and false boolean values
      if (value === '' || value === undefined || value === null) {
        return;
      }
      
      // Handle boolean values (only include if true)
      if (typeof value === 'boolean') {
        if (value === true) {
          params.set(field, 'true');
        }
      } 
      // Include other non-empty values
      else {
        params.set(field, value);
      }
    });
    
    // Update URL with current filters
    setSearchParams(params);
  };
  
  // Reset all filters
  const resetFilters = () => {
    // Reset all query parameters
    setSearchParams({});
    
    // Reset local state to default values
    setQuery({
      type: '',
      city: '',
      property: '',
      locationType: '',
      bedroom: '',
      minPrice: '',
      maxPrice: '',
      minSize: '',
      maxSize: '',
      crewSize: '',
      hasFilmingPermit: false,
      hasStudio: false,
      hasPower: false,
      availableParking: false,
    });
  };

  return (
    <div className="filter">
      <h1>
        Search results for <b>{searchParams.get("city")}</b>
      </h1>

      {/* Location Input Field */}
      <div className="top">
        <div className="item">
          <label htmlFor="city">Location</label>
          <input
            type="text"
            id="city"
            name="city"
            placeholder="City Location"
            onChange={handleChange}
            defaultValue={query.city}
          />
        </div>
      </div>

      {/* Filter Options */}
      <div className="bottom">
        {/* Property Type Selection */}
        {/* Property Type Selection */}
        <div className="item">
          <label htmlFor="type">Type</label>
          <select
            name="type"
            id="type"
            onChange={handleChange}
            defaultValue={query.type}
          >
            <option value="">Any</option>
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
          </select>
        </div>

        {/* Property Type */}
        <div className="item">
          <label htmlFor="property">Property Type</label>
          <select name="property" id="property" value={query.property} onChange={handleChange}>
            <option value="">Any</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="condo">Condo</option>
            <option value="land">Land</option>
          </select>
        </div>

        {/* Location Type */}
        <div className="item">
          <label htmlFor="locationType">Location Type</label>
          <select name="locationType" id="locationType" value={query.locationType} onChange={handleChange}>
            <option value="">Location Type</option>
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
          </select>
        </div>

        {/* Genre */}
        <div className="item">
          <label htmlFor="genre">Genre</label>
          <select name="genre" id="genre" value={query.genre} onChange={handleChange}>
            <option value="">Any Genre</option>
            <option value="Action">Action</option>
            <option value="Horror">Horror</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Romance">Romance</option>
            <option value="Historical">Historical</option>
            <option value="Drama">Drama</option>
            <option value="Fantasy">Fantasy</option>
          </select>
        </div>

        {/* Minimum Price Input */}
        <div className="item">
          <label htmlFor="minPrice">Min Price</label>
          <input
            type="number"
            id="minPrice"
            name="minPrice"
            placeholder="Any"
            min="0"
            step="100"
            onChange={handleChange}
            value={query.minPrice || ''}
          />
        </div>

        {/* Maximum Price Input */}
        <div className="item">
          <label htmlFor="maxPrice">Max Price</label>
          <input
            type="number"
            id="maxPrice"
            name="maxPrice"
            placeholder="Any"
            min="0"
            step="100"
            onChange={handleChange}
            value={query.maxPrice || ''}
          />
        </div>

        {/* Bedroom Count Input */}
        <div className="item">
          <label htmlFor="bedroom">Bedroom</label>
          <input
            type="text"
            id="bedroom"
            name="bedroom"
            placeholder="Any"
            onChange={handleChange}
            defaultValue={query.bedroom}
          />
        </div>

        {/* Search and Reset Buttons */}
        <div className="buttons">
          <button onClick={handleFilter} className="search-button">
            <img src="/search.png" alt="Search" />
            Apply Filters
          </button>
          <button onClick={resetFilters} className="reset-button">
            Reset
          </button>
        </div>
      </div>
      
      {/* Advanced Filters Section */}
      <div className="advanced-filters">
        <h3>Advanced Filters</h3>
        
        <div className="filter-group">
          <h4>Size (sqm)</h4>
          <div className="range-inputs">
            <div className="input-group">
              <label htmlFor="minSize">Min</label>
              <input
                type="number"
                id="minSize"
                name="minSize"
                placeholder="Min"
                onChange={handleChange}
                value={query.minSize}
                min="0"
              />
            </div>
            <div className="input-group">
              <label htmlFor="maxSize">Max</label>
              <input
                type="number"
                id="maxSize"
                name="maxSize"
                placeholder="Max"
                onChange={handleChange}
                value={query.maxSize}
                min="0"
              />
            </div>
          </div>
        </div>
        
        <div className="filter-group">
          <h4>Minimum Crew Size</h4>
          <input
            type="number"
            id="crewSize"
            name="crewSize"
            placeholder="Any"
            onChange={handleChange}
            value={query.crewSize}
            min="0"
          />
        </div>
        
        <div className="filter-group">
          <h4>Amenities</h4>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="hasFilmingPermit"
                checked={query.hasFilmingPermit}
                onChange={handleChange}
              />
              Has Filming Permit
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="hasStudio"
                checked={query.hasStudio}
                onChange={handleChange}
              />
              Has Studio
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="hasPower"
                checked={query.hasPower}
                onChange={handleChange}
              />
              Has Power Supply
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="availableParking"
                checked={query.availableParking}
                onChange={handleChange}
              />
              Available Parking
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Filter;
