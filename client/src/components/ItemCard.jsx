import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ItemCard = ({ item }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'lost':
        return 'danger';
      case 'found':
        return 'success';
      case 'claimed':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="item-card h-100 position-relative">
      <Badge 
        bg={getStatusColor(item.status)} 
        className="status-badge"
      >
        {item.status.toUpperCase()}
      </Badge>
      
      {item.image_path && (
        <Card.Img 
          variant="top" 
          src={`/uploads/${item.image_path}`}
          className="item-image"
          alt={item.name}
        />
      )}
      
      <Card.Body className="d-flex flex-column">
        <Card.Title className="h6">{item.name}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          {item.category}
        </Card.Subtitle>
        <Card.Text className="flex-grow-1">
          {item.description?.substring(0, 100)}
          {item.description?.length > 100 && '...'}
        </Card.Text>
        <div className="mt-auto">
          <small className="text-muted d-block mb-2">
            {formatDate(item.created_at)}
          </small>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={() => navigate(`/item/${item.id}`)}
            className="w-100"
          >
            View Details
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ItemCard;