import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Card } from 'react-bootstrap';
import { itemsAPI } from '../services/api';

const SearchFilters = ({ onSearch, onReset }) => {
  const [filters, setFilters] = useState({
    keyword: '',
    status: '',
    category: '',
    unique_id: '',
    lat: '',
    lon: '',
    radius: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [locationEnabled, setLocationEnabled] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await itemsAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      keyword: '',
      status: '',
      category: '',
      unique_id: '',
      lat: '',
      lon: '',
      radius: ''
    };
    setFilters(resetFilters);
    setLocationEnabled(false);
    onReset();
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFilters(prev => ({
            ...prev,
            lat: position.coords.latitude.toString(),
            lon: position.coords.longitude.toString(),
            radius: prev.radius || '5' // Default 5km radius
          }));
          setLocationEnabled(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please check your browser settings.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <Card className="search-filters-card mb-4 fade-in">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center mb-4">
          <div className="filter-icon me-3">
            <svg width="24" height="24" fill="currentColor" className="text-primary">
              <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
            </svg>
          </div>
          <h5 className="mb-0 gradient-text fw-bold">🔍 Search & Filter</h5>
        </div>
        
        <Form onSubmit={handleSearch}>
          <Row className="g-4">
            <Col md={6}>
              <Form.Group className="search-input-group">
                <Form.Label className="fw-semibold text-dark mb-2">
                  <svg width="16" height="16" fill="currentColor" className="me-2">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                  Keyword Search
                </Form.Label>
                <Form.Control
                  type="text"
                  name="keyword"
                  placeholder="🔍 Search by name or description..."
                  value={filters.keyword}
                  onChange={handleFilterChange}
                  className="modern-input"
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="search-input-group">
                <Form.Label className="fw-semibold text-dark mb-2">
                  <svg width="16" height="16" fill="currentColor" className="me-2">
                    <path d="M4 0a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4H4zm0 1h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3z"/>
                  </svg>
                  Unique ID
                </Form.Label>
                <Form.Control
                  type="text"
                  name="unique_id"
                  placeholder="🏷️ Enter unique item ID..."
                  value={filters.unique_id}
                  onChange={handleFilterChange}
                  className="modern-input"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="g-4 mt-1">
            <Col md={6}>
              <Form.Group className="search-input-group">
                <Form.Label className="fw-semibold text-dark mb-2">
                  <svg width="16" height="16" fill="currentColor" className="me-2">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                  </svg>
                  Status
                </Form.Label>
                <Form.Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="modern-select"
                >
                  <option value="">📋 All Status</option>
                  <option value="lost">❌ Lost</option>
                  <option value="found">✅ Found</option>
                  <option value="claimed">🎉 Claimed</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="search-input-group">
                <Form.Label className="fw-semibold text-dark mb-2">
                  <svg width="16" height="16" fill="currentColor" className="me-2">
                    <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                  </svg>
                  Category
                </Form.Label>
                <Form.Select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="modern-select"
                >
                  <option value="">📂 All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      📁 {category}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="g-4 mt-1">
            <Col md={8}>
              <Form.Group className="search-input-group">
                <Form.Label className="fw-semibold text-dark mb-2">
                  <svg width="16" height="16" fill="currentColor" className="me-2">
                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                  </svg>
                  Location Search
                </Form.Label>
                <div className="location-controls d-flex gap-3 align-items-end">
                  <Button
                    type="button"
                    variant={locationEnabled ? "success" : "outline-primary"}
                    onClick={getCurrentLocation}
                    disabled={locationEnabled}
                    className="location-btn px-4 py-2"
                  >
                    {locationEnabled ? (
                      <>
                        <svg width="16" height="16" fill="currentColor" className="me-2">
                          <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                        </svg>
                        Location Set
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" fill="currentColor" className="me-2">
                          <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                        </svg>
                        Get My Location
                      </>
                    )}
                  </Button>
                  
                  {locationEnabled && (
                    <div className="radius-input-wrapper">
                      <Form.Control
                        type="number"
                        name="radius"
                        placeholder="Radius"
                        value={filters.radius}
                        onChange={handleFilterChange}
                        className="radius-input"
                        min="1"
                        max="100"
                      />
                      <small className="text-muted">km</small>
                    </div>
                  )}
                </div>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <div className="action-buttons d-flex gap-3 h-100 align-items-end">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="search-btn flex-fill px-4 py-2"
                  size="lg"
                >
                  <svg width="16" height="16" fill="currentColor" className="me-2">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                  Search
                </Button>
                <Button 
                  type="button" 
                  variant="outline-secondary" 
                  onClick={handleReset}
                  className="reset-btn px-4 py-2"
                  size="lg"
                >
                  <svg width="16" height="16" fill="currentColor" className="me-2">
                    <path d="M1.705 8.005a.5.5 0 0 1 .834.656 5.5 5.5 0 0 1-2.911 2.711.5.5 0 1 1-.276-.952A4.498 4.498 0 0 0 1.705 8.005zm.834-.656a.5.5 0 0 1-.834.656A4.498 4.498 0 0 0 1.352 6.295a.5.5 0 1 1 .276-.952 5.5 5.5 0 0 1 2.911 2.711zm8.953.656a.5.5 0 1 1 .834-.656 5.5 5.5 0 0 1 2.911-2.711.5.5 0 1 1 .276.952A4.498 4.498 0 0 0 14.061 8.005z"/>
                    <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                  </svg>
                  Reset
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
        
        <div className="search-tips mt-4 pt-3 border-top">
          <small className="text-muted">
            <svg width="14" height="14" fill="currentColor" className="me-2">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
            </svg>
            <strong>Pro Tips:</strong> Use keywords for better results • Enable location for nearby items • Try different combinations of filters
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SearchFilters;