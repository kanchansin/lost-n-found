import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card, Image } from 'react-bootstrap';
import { itemsAPI } from '../services/api';

const ReportItem = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    status: 'lost',
    unique_id: '',
    image: null
  });
  
  const [location, setLocation] = useState({
    lat: null,
    lon: null,
    locationObtained: false
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdItem, setCreatedItem] = useState(null);

  useEffect(() => {
    loadCategories();
    getCurrentLocation();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await itemsAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            locationObtained: true
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. You can still submit without location data.');
        }
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('status', formData.status);
      submitData.append('unique_id', formData.unique_id);
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }
      
      if (location.lat && location.lon) {
        submitData.append('lat', location.lat);
        submitData.append('lon', location.lon);
      }
      
      const response = await itemsAPI.createItem(submitData);
      
      setSuccess('Item reported successfully!');
      setCreatedItem(response.data.item);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        status: 'lost',
        unique_id: '',
        image: null
      });
      
      // Reset file input
      const fileInput = document.getElementById('image');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error creating item:', error);
      setError(error.response?.data?.error || 'Failed to report item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <Card>
            <Card.Body>
              <h2 className="mb-4">Report Lost or Found Item</h2>
              
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                  {success}
                </Alert>
              )}
              
              {createdItem && (
                <Alert variant="info" className="mb-4">
                  <h6>Item Created Successfully!</h6>
                  <p className="mb-2"><strong>Unique ID:</strong> {createdItem.unique_id}</p>
                  <p className="mb-3">Save this ID to reference your item later.</p>
                  
                  {createdItem.qr_code_path && (
                    <div className="qr-code-display">
                      <p><strong>QR Code:</strong></p>
                      <Image 
                        src={`/qrcodes/${createdItem.qr_code_path}`}
                        alt="QR Code"
                        style={{ maxWidth: '200px' }}
                      />
                      <p className="mt-2 small text-muted">
                        Share this QR code to help others identify your item
                      </p>
                    </div>
                  )}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Item Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., iPhone 13, Blue Wallet, etc."
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category *</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Category</option>
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
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status *</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="lost">Lost</option>
                        <option value="found">Found</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Unique ID (Optional)</Form.Label>
                      <Form.Control
                        type="text"
                        name="unique_id"
                        value={formData.unique_id}
                        onChange={handleInputChange}
                        placeholder="Serial number, custom ID, etc."
                      />
                      <Form.Text className="text-muted">
                        Leave empty to auto-generate a unique ID
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide additional details about the item..."
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Photo (Optional)</Form.Label>
                  <Form.Control
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <Form.Text className="text-muted">
                    Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                  </Form.Text>
                </Form.Group>
                
                <div className="mb-3">
                  <strong>Location: </strong>
                  {location.locationObtained ? (
                    <span className="text-success">
                      📍 Location obtained ({location.lat.toFixed(6)}, {location.lon.toFixed(6)})
                    </span>
                  ) : (
                    <span className="text-warning">
                      📍 Location not available
                    </span>
                  )}
                </div>
                
                <div className="d-grid gap-2">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Reporting Item...' : 'Report Item'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ReportItem;