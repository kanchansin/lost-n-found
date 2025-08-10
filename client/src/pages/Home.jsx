import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner, Badge, Button } from 'react-bootstrap';
import ItemCard from '../components/ItemCard';
import SearchFilters from '../components/SearchFilters';
import { itemsAPI } from '../services/api';
import socketService from '../services/socket';

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchApplied, setSearchApplied] = useState(false);
  const [stats, setStats] = useState({ total: 0, lost: 0, found: 0, claimed: 0 });

  useEffect(() => {
    loadItems();
    
    // Connect to socket for real-time updates
    const socket = socketService.connect();
    
    socket.on('newItem', (newItem) => {
      setItems(prevItems => [newItem, ...prevItems]);
      updateStats(prevItems => [...prevItems, newItem]);
    });
    
    socket.on('itemClaimed', (updatedItem) => {
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        )
      );
    });
    
    return () => {
      socketService.disconnect();
    };
  }, []);

  const updateStats = (itemsList) => {
    const total = itemsList.length;
    const lost = itemsList.filter(item => item.status === 'lost').length;
    const found = itemsList.filter(item => item.status === 'found').length;
    const claimed = itemsList.filter(item => item.status === 'claimed').length;
    setStats({ total, lost, found, claimed });
  };

  const loadItems = async (filters = {}) => {
    try {
      setLoading(true);
      setError('');
      const response = await itemsAPI.getItems(filters);
      setItems(response.data);
      updateStats(response.data);
    } catch (error) {
      console.error('Error loading items:', error);
      setError('Failed to load items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters) => {
    setSearchApplied(true);
    loadItems(filters);
  };

  const handleReset = () => {
    setSearchApplied(false);
    loadItems();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'lost': return '❌';
      case 'found': return '✅';
      case 'claimed': return '🎉';
      default: return '📋';
    }
  };

  return (
    <>
      {/* Hero Section */}
      <div className="hero-section">
        <Container>
          <Row>
            <Col lg={10} xl={8} className="mx-auto text-center">
              <div className="hero-content fade-in">
                <h1 className="hero-title display-3 mb-4">
                  <span className="gradient-text">Lost & Found</span>
                </h1>
                <p className="hero-subtitle lead mb-4">
                  Reuniting people with their belongings through technology. 
                  Report lost items, help others find their stuff, or scan QR codes 
                  to instantly connect with owners.
                </p>
                <div className="hero-stats d-flex justify-content-center gap-4 mb-4 flex-wrap">
                  <div className="stat-item">
                    <div className="stat-number">{stats.total}</div>
                    <div className="stat-label">Total Items</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number text-danger">{stats.lost}</div>
                    <div className="stat-label">Lost</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number text-success">{stats.found}</div>
                    <div className="stat-label">Found</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number text-warning">{stats.claimed}</div>
                    <div className="stat-label">Reunited</div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
        
        {/* Floating elements */}
        <div className="floating-elements">
          <div className="floating-item floating-1">🔍</div>
          <div className="floating-item floating-2">📱</div>
          <div className="floating-item floating-3">👜</div>
          <div className="floating-item floating-4">🔑</div>
          <div className="floating-item floating-5">💼</div>
        </div>
      </div>

      {/* Main Content */}
      <Container className="main-content">
        <SearchFilters onSearch={handleSearch} onReset={handleReset} />
        
        {error && (
          <Alert variant="danger" className="modern-alert mb-4 fade-in">
            <div className="d-flex align-items-center">
              <svg width="20" height="20" fill="currentColor" className="me-3">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              {error}
            </div>
          </Alert>
        )}
        
        {loading ? (
          <div className="modern-loading">
            <div className="loading-container">
              <div className="loading-spinner-modern">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
              </div>
              <h5 className="mt-4 text-muted">Loading items...</h5>
              <p className="text-muted">Fetching the latest lost and found items</p>
            </div>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="results-header mb-4 fade-in">
              <Row className="align-items-center">
                <Col md={8}>
                  <div className="d-flex align-items-center gap-3">
                    <h3 className="results-title mb-0">
                      {searchApplied ? (
                        <>
                          <svg width="20" height="20" fill="currentColor" className="me-2 text-primary">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                          </svg>
                          Search Results
                        </>
                      ) : (
                        <>
                          <svg width="20" height="20" fill="currentColor" className="me-2 text-success">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                          </svg>
                          Recent Items
                        </>
                      )}
                    </h3>
                    <Badge bg="light" text="dark" className="count-badge">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </Badge>
                  </div>
                </Col>
                <Col md={4} className="text-end">
                  {items.length > 0 && (
                    <div className="view-options">
                      <small className="text-muted">
                        Showing {searchApplied ? 'filtered' : 'all'} results
                      </small>
                    </div>
                  )}
                </Col>
              </Row>
            </div>
            
            {/* Items Grid or Empty State */}
            {items.length === 0 ? (
              <div className="empty-state text-center py-5 fade-in">
                <div className="empty-state-icon mb-4">
                  {searchApplied ? '🔍' : '📦'}
                </div>
                <h4 className="empty-state-title mb-3">
                  {searchApplied ? 'No items found' : 'No items yet'}
                </h4>
                <p className="empty-state-text mb-4 text-muted">
                  {searchApplied 
                    ? 'Try adjusting your search criteria or reset filters to see more results.'
                    : 'Be the first to report a lost or found item and help build our community!'
                  }
                </p>
                <div className="empty-state-actions">
                  {searchApplied ? (
                    <Button variant="outline-primary" onClick={handleReset} className="me-3">
                      <svg width="16" height="16" fill="currentColor" className="me-2">
                        <path d="M1.705 8.005a.5.5 0 0 1 .834.656 5.5 5.5 0 0 1-2.911 2.711.5.5 0 1 1-.276-.952A4.498 4.498 0 0 0 1.705 8.005zm.834-.656a.5.5 0 0 1-.834.656A4.498 4.498 0 0 0 1.352 6.295a.5.5 0 1 1 .276-.952 5.5 5.5 0 0 1 2.911 2.711z"/>
                      </svg>
                      Reset Filters
                    </Button>
                  ) : null}
                  <Button variant="primary" href="/report">
                    <svg width="16" height="16" fill="currentColor" className="me-2">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                    </svg>
                    Report an Item
                  </Button>
                </div>
              </div>
            ) : (
              <Row className="items-grid">
                {items.map((item, index) => (
                  <Col key={item.id} lg={3} md={4} sm={6} className="mb-4">
                    <div 
                      className="item-wrapper fade-in" 
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <ItemCard item={item} />
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default Home;