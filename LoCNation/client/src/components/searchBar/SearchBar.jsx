import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Drawer, IconButton, Button, TextField, FormControlLabel, Checkbox, FormGroup, MenuItem, Select, InputLabel, FormControl, Box, Typography } from "@mui/material";
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import "./searchBar.scss";

function SearchBar() {
  const [searchParams] = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || 'rent',
    city: searchParams.get('city') || '',
    property: searchParams.get('property') || '',
    locationType: searchParams.get('locationType') || '',
    genre: searchParams.get('genre') || '',
    bedroom: searchParams.get('bedroom') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    // Use hasFilmingPermit to match backend
    hasFilmingPermit: searchParams.get('hasFilmingPermit') === 'true' || false,
    hasStudio: searchParams.get('hasStudio') === 'true' || false,
    hasPower: searchParams.get('hasPower') === 'true' || false,
    availableParking: searchParams.get('availableParking') === 'true' || false,
    minSize: searchParams.get('minSize') || '',
    maxSize: searchParams.get('maxSize') || '',
    crewSize: searchParams.get('crewSize') || '',
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Update filters when URL params change
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      type: searchParams.get('type') || 'rent',
      city: searchParams.get('city') || '',
      property: searchParams.get('property') || '',
      locationType: searchParams.get('locationType') || '',
      genre: searchParams.get('genre') || '',
      bedroom: searchParams.get('bedroom') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      // Use hasFilmingPermit to match backend
      hasFilmingPermit: searchParams.get('hasFilmingPermit') === 'true' || false,
      hasStudio: searchParams.get('hasStudio') === 'true' || false,
      hasPower: searchParams.get('hasPower') === 'true' || false,
      availableParking: searchParams.get('availableParking') === 'true' || false,
      minSize: searchParams.get('minSize') || '',
      maxSize: searchParams.get('maxSize') || '',
      crewSize: searchParams.get('crewSize') || '',
    }));
  }, [searchParams]);

  const validate = () => {
    if (!filters.city.trim()) {
      setError("The city field cannot be empty.");
      return false;
    }

    if (filters.minPrice && filters.maxPrice && Number(filters.minPrice) > Number(filters.maxPrice)) {
      setError("Minimum price cannot be greater than maximum price.");
      return false;
    }

    if (filters.minSize && filters.maxSize && Number(filters.minSize) > Number(filters.maxSize)) {
      setError("Minimum size cannot be greater than maximum size.");
      return false;
    }

    setError("");
    return true;
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    // Add all non-empty filters to the query string
    Object.entries(filters).forEach(([key, value]) => {
      // Skip empty strings
      if (value === '') return;
      
      // Only include boolean filters if they are explicitly set to true
      if (['hasFilmingPermit', 'hasStudio', 'hasPower', 'availableParking'].includes(key)) {
        if (value === true) {
          params.set(key, 'true');
        }
      } 
      // Include other non-empty values
      else if (value !== undefined && value !== null) {
        params.set(key, value);
      }
    });
    
    return params.toString();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const queryString = buildQueryString();
    navigate(`/list?${queryString}`);
  };

  const handleApplyFilters = () => {
    if (!validate()) return;
    
    const queryString = buildQueryString();
    navigate(`/list?${queryString}`);
    setIsDrawerOpen(false);
  };

  const handleResetFilters = () => {
    setFilters({
      type: 'rent',
      city: '',
      property: '',
      locationType: '',
      genre: '',
      bedroom: '',
      minPrice: '',
      maxPrice: '',
      hasPermit: false,
      hasStudio: false,
      hasPower: false,
      availableParking: false,
      minSize: '',
      maxSize: '',
      crewSize: '',
    });
  };

  const renderFilterDrawer = () => (
    <Box sx={{ width: 350, p: 3 }} role="presentation">
      <div className="filter-header">
        <Typography variant="h6">Filter Options</Typography>
        <IconButton onClick={() => setIsDrawerOpen(false)}>
          <CloseIcon />
        </IconButton>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="filter-section">
          <Typography variant="subtitle1" gutterBottom>Property Type</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              label="Type"
            >
              <MenuItem value="rent">Rent</MenuItem>
              <MenuItem value="buy">Buy</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Property</InputLabel>
            <Select
              name="property"
              value={filters.property}
              onChange={handleFilterChange}
              label="Property"
            >
              <MenuItem value="apartment">Apartment</MenuItem>
              <MenuItem value="house">House</MenuItem>
              <MenuItem value="condo">Condo</MenuItem>
              <MenuItem value="land">Land</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Location Type</InputLabel>
            <Select
              name="locationType"
              value={filters.locationType}
              onChange={handleFilterChange}
              label="Location Type"
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="indoor">Indoor</MenuItem>
              <MenuItem value="outdoor">Outdoor</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Genre</InputLabel>
            <Select
              name="genre"
              value={filters.genre}
              onChange={handleFilterChange}
              label="Genre"
            >
              <MenuItem value="">Any Genre</MenuItem>
              <MenuItem value="Action">Action</MenuItem>
              <MenuItem value="Horror">Horror</MenuItem>
              <MenuItem value="Sci-Fi">Sci-Fi</MenuItem>
              <MenuItem value="Romance">Romance</MenuItem>
              <MenuItem value="Historical">Historical</MenuItem>
              <MenuItem value="Drama">Drama</MenuItem>
              <MenuItem value="Fantasy">Fantasy</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Bedrooms</InputLabel>
            <Select
              name="bedroom"
              value={filters.bedroom}
              onChange={handleFilterChange}
              label="Bedrooms"
            >
              {[1, 2, 3, 4, '5+'].map(num => (
                <MenuItem key={num} value={num}>
                  {num === '5+' ? '5+' : `${num} ${num === 1 ? 'bedroom' : 'bedrooms'}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="filter-section">
          <Typography variant="subtitle1" gutterBottom>Price Range</Typography>
          <div className="filter-row">
            <TextField
              fullWidth
              type="number"
              name="minPrice"
              label="Min Price"
              value={filters.minPrice}
              onChange={handleFilterChange}
              margin="normal"
              InputProps={{ inputProps: { min: 0 } }}
            />
            <span className="filter-separator">-</span>
            <TextField
              fullWidth
              type="number"
              name="maxPrice"
              label="Max Price"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              margin="normal"
              InputProps={{ inputProps: { min: 0 } }}
            />
          </div>
        </div>

        <div className="filter-section">
          <Typography variant="subtitle1" gutterBottom>Size (sqm)</Typography>
          <div className="filter-row">
            <TextField
              fullWidth
              type="number"
              name="minSize"
              label="Min Size"
              value={filters.minSize}
              onChange={handleFilterChange}
              margin="normal"
              InputProps={{ inputProps: { min: 0 } }}
            />
            <span className="filter-separator">-</span>
            <TextField
              fullWidth
              type="number"
              name="maxSize"
              label="Max Size"
              value={filters.maxSize}
              onChange={handleFilterChange}
              margin="normal"
              InputProps={{ inputProps: { min: 0 } }}
            />
          </div>
        </div>

        <div className="filter-section">
          <Typography variant="subtitle1" gutterBottom>Amenities</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  name="hasPermit"
                  checked={filters.hasPermit}
                  onChange={handleFilterChange}
                />
              }
              label="Has Filming Permit"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="hasStudio"
                  checked={filters.hasStudio}
                  onChange={handleFilterChange}
                />
              }
              label="Has Studio"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="hasPower"
                  checked={filters.hasPower}
                  onChange={handleFilterChange}
                />
              }
              label="Has Power Supply"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="availableParking"
                  checked={filters.availableParking}
                  onChange={handleFilterChange}
                />
              }
              label="Available Parking"
            />
          </FormGroup>
        </div>

        <div className="filter-section">
          <Typography variant="subtitle1" gutterBottom>Crew</Typography>
          <TextField
            fullWidth
            type="number"
            name="crewSize"
            label="Minimum Crew Size"
            value={filters.crewSize}
            onChange={handleFilterChange}
            margin="normal"
            InputProps={{ inputProps: { min: 0 } }}
          />
        </div>

        <div className="filter-actions">
          <Button
            variant="outlined"
            onClick={handleResetFilters}
            fullWidth
            sx={{ mb: 2 }}
          >
            Reset Filters
          </Button>
          <Button
            type="submit"
            variant="contained"
            onClick={handleApplyFilters}
            fullWidth
          >
            Apply Filters
          </Button>
        </div>
      </form>
    </Box>
  );

  return (
    <div className="searchBar">
      <form onSubmit={handleSubmit} className="search-form">
        <TextField
          type="text"
          name="city"
          placeholder="City"
          value={filters.city}
          onChange={handleFilterChange}
          variant="outlined"
          size="small"
          className="search-input"
        />
        
        <Button
          type="button"
          variant="outlined"
          onClick={() => setIsDrawerOpen(true)}
          startIcon={<FilterListIcon />}
          className="filter-button"
        >
          Filters
        </Button>
        
        <Button
          type="submit"
          variant="contained"
          className="search-button"
          startIcon={<img src="/search.png" alt="Search" className="search-icon" />}
        >
          Search
        </Button>
      </form>

      {/* Error message */}
      {error && <div className="error-message">{error}</div>}

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {renderFilterDrawer()}
      </Drawer>
    </div>
  );
}

export default SearchBar;
