import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Image, Badge, Spinner } from 'react-bootstrap';
import { itemsAPI } from '../services/api';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try to get item by regular ID first, then by unique ID
      let response;
      if (id.length > 20) { // Likely a UUID
        response = await itemsAPI.getItemByUniqueId(id);
      } else {
        response = await itemsAPI.getItem(id);
      }
      
      setItem(response.data);
    } catch (error) {
      console.error('Error loading item:', error);
      setError('Item not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimItem = async () => {
    if (!item || item.status === 'claimed') return;
    
    setClaiming(true);
    try {
      await itemsAPI.claimItem(item.id);
      setItem(prev => ({ ...prev, status: 'claimed' }));
      alert('Item marked as claimed successfully!');
    } catch (error) {
      console.error('Error claiming item:', error);
      alert('Failed to claim item. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'lost': return 'danger';
      case 'found': return 'success';
      case 'claimed': return 'secondary';
      default: return 'primary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGoogleMapsUrl = (lat, lon) => {
    return `https://www.google.com/maps?q=${lat},${lon}`;
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="loading-spinner">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Error</h4>
          <p>{error}</p>
          <Button variant="outline-primary" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!item) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <h4>Item Not Found</h4>
          <p>The requested item could not be found.</p>
          <Button variant="outline-primary" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <Button 
            variant="outline-secondary" 
            className="mb-3"
            onClick={() => navigate('/')}
          >
            ← Back to Items
          </Button>
          
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h2>{item.name}</h2>
                <Badge bg={getStatusColor(item.status)} className="fs-6">
                  {item.status.toUpperCase()}
                </Badge>
              </div>
              
              <Row>
                <Col md={6}>
                  {item.image_path && (
                    <div className="mb-4">
                      <Image 
                        src={`/uploads/${item.image_path}`}
                        alt={item.name}
                        className="item-details-image"
                        fluid
                      />
                    </div>
                  )}
                  
                  {item.qr_code_path && (
                    <div className="qr-code-display mb-4">
                      <h6>QR Code</h6>
                      <Image 
                        src={`/qrcodes/${item.qr_code_path}`}
                        alt="QR Code"
                        style={{ maxWidth: '200px' }}
                      />
                      <p className="small text-muted mt-2">
                        Scan this code to quickly access this item
                      </p>
                    </div>
                  )}
                </Col>
                
                <Col md={6}>
                  <div className="mb-3">
                    <h6>Details</h6>
                    <table className="table table-borderless">
                      <tbody>
                        <tr>
                          <td><strong>Category:</strong></td>
                          <td>{item.category}</td>
                        </tr>
                        <tr>
                          <td><strong>Unique ID:</strong></td>
                          <td>
                            <code>{item.unique_id}</code>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Reported:</strong></td>
                          <td>{formatDate(item.created_at)}</td>
                        </tr>
                        {item.lat && item.lon && (
                          <tr>
                            <td><strong>Location:</strong></td>
                            <td>
                              <a 
                                href={getGoogleMapsUrl(item.lat, item.lon)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-primary btn-sm"
                              >
                                📍 View on Google Maps
                              </a>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {item.description && (
                    <div className="mb-4">
                      <h6>Description</h6>
                      <p>{item.description}</p>
                    </div>
                  )}
                  
                  {item.status !== 'claimed' && (
                    <div className="d-grid">
                      <Button 
                        variant="success" 
                        size="lg"
                        onClick={handleClaimItem}
                        disabled={claiming}
                      >
                        {claiming ? 'Marking as Claimed...' : 'Mark as Claimed'}
                      </Button>
                      <small className="text-muted text-center mt-2">
                        Click this button if you have {item.status === 'lost' ? 'found' : 'reunited'} this item
                      </small>
                    </div>
                  )}
                  
                  {item.status === 'claimed' && (
                    <Alert variant="success">
                      <strong>✅ Item Claimed</strong>
                      <p className="mb-0">This item has been marked as claimed.</p>
                    </Alert>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ItemDetails;