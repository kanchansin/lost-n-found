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
    <Card className="mb-4">
      <Card.Body>
        <h5 className="mb-3">Search & Filter</h5>
        <Form onSubmit={handleSearch}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Keyword Search</Form.Label>
                <Form.Control
                  type="text"
                  name="keyword"
                  placeholder="Search by name or description..."
                  value={filters.keyword}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Unique ID</Form.Label>
                <Form.Control
                  type="text"
                  name="unique_id"
                  placeholder="Enter unique item ID..."
                  value={filters.unique_id}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Status</option>
                  <option value="lost">Lost</option>
                  <option value="found">Found</option>
                  <option value="claimed">Claimed</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Location Search</Form.Label>
                <div className="d-flex gap-2">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={getCurrentLocation}
                    disabled={locationEnabled}
                  >
                    {locationEnabled ? '📍 Location Set' : '📍 Get My Location'}
                  </Button>
                  {locationEnabled && (
                    <Form.Control
                      type="number"
                      name="radius"
                      placeholder="Radius (km)"
                      value={filters.radius}
                      onChange={handleFilterChange}
                      style={{ maxWidth: '120px' }}
                      min="1"
                      max="100"
                    />
                  )}
                </div>
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end gap-2">
              <Button type="submit" variant="primary" className="mb-3">
                Search
              </Button>
              <Button 
                type="button" 
                variant="outline-secondary" 
                onClick={handleReset}
                className="mb-3"
              >
                Reset
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SearchFilters;
