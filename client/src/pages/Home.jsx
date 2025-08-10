import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import ItemCard from '../components/ItemCard';
import SearchFilters from '../components/SearchFilters';
import { itemsAPI } from '../services/api';
import socketService from '../services/socket';

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchApplied, setSearchApplied] = useState(false);

  useEffect(() => {
    loadItems();
    
    // Connect to socket for real-time updates
    const socket = socketService.connect();
    
    socket.on('newItem', (newItem) => {
      setItems(prevItems => [newItem, ...prevItems]);
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

  const loadItems = async (filters = {}) => {
    try {
      setLoading(true);
      setError('');
      const response = await itemsAPI.getItems(filters);
      setItems(response.data);
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

  return (
    <>
      <div className="search-section">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h1 className="display-4 mb-3">Lost & Found</h1>
              <p className="lead">
                Report lost items or help others find their belongings. 
                Search by keyword, location, or scan QR codes to reunite people with their items.
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        <SearchFilters onSearch={handleSearch} onReset={handleReset} />
        
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}
        
        {loading ? (
          <div className="loading-spinner">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3>
                {searchApplied ? 'Search Results' : 'Recent Items'} 
                <span className="text-muted fs-6 ms-2">
                  ({items.length} {items.length === 1 ? 'item' : 'items'})
                </span>
              </h3>
            </div>
            
            {items.length === 0 ? (
              <Alert variant="info" className="text-center">
                <h5>No items found</h5>
                <p className="mb-0">
                  {searchApplied 
                    ? 'Try adjusting your search criteria or reset filters.'
                    : 'Be the first to report a lost or found item!'
                  }
                </p>
              </Alert>
            ) : (
              <Row>
                {items.map(item => (
                  <Col key={item.id} lg={3} md={4} sm={6} className="mb-4">
                    <ItemCard item={item} />
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
