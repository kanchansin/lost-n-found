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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'lost':
        return '❌';
      case 'found':
        return '✅';
      case 'claimed':
        return '🎉';
      default:
        return '📋';
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
        {getStatusIcon(item.status)} {item.status.toUpperCase()}
      </Badge>
      
      {item.image_path ? (
        <Card.Img 
          variant="top" 
          src={`/uploads/${item.image_path}`}
          className="item-image"
          alt={item.name}
        />
      ) : (
        <div 
          className="item-image d-flex align-items-center justify-content-center"
          style={{ 
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-inset)',
            fontSize: '3rem',
            opacity: '0.3'
          }}
        >
          📦
        </div>
      )}
      
      <Card.Body className="d-flex flex-column p-4">
        <div className="mb-3">
          <Card.Title className="h5 mb-2 text-neo-primary fw-bold">
            {item.name}
          </Card.Title>
          <Card.Subtitle className="mb-2 text-neo-muted fw-semibold">
            <svg width="16" height="16" fill="currentColor" className="me-2">
              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3z"/>
              <path d="M9 2.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3z"/>
              <path d="M1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3z"/>
              <path d="M9 10.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
            </svg>
            {item.category}
          </Card.Subtitle>
        </div>
        
        <Card.Text className="flex-grow-1 text-neo-secondary">
          {item.description?.substring(0, 100)}
          {item.description?.length > 100 && '...'}
        </Card.Text>
        
        <div className="mt-auto pt-3">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <small className="text-neo-muted d-flex align-items-center">
              <svg width="14" height="14" fill="currentColor" className="me-2">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/>
              </svg>
              {formatDate(item.created_at)}
            </small>
          </div>
          
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={() => navigate(`/item/${item.id}`)}
            className="w-100 fw-semibold"
          >
            <svg width="16" height="16" fill="currentColor" className="me-2">
              <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
            </svg>
            View Details
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ItemCard;