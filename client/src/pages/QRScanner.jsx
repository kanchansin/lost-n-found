import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = () => {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [scannedData, setScannedData] = useState('');

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanning = () => {
    setIsScanning(true);
    setError('');
    setScannedData('');

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        // Stop scanning
        scanner.clear();
        setIsScanning(false);
        handleScanSuccess(decodedText);
      },
      (error) => {
        // Handle scan error (usually just no QR code found)
        console.log('Scan error:', error);
      }
    );
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      setIsScanning(false);
    }
  };

  const handleScanSuccess = (decodedText) => {
    setScannedData(decodedText);
    
    // Parse QR code data
    // Expected format: "unique_id|url" or just "unique_id"
    let uniqueId = decodedText;
    
    if (decodedText.includes('|')) {
      const parts = decodedText.split('|');
      uniqueId = parts[0];
    }
    
    // Navigate to item details
    if (uniqueId) {
      navigate(`/item/${uniqueId}`);
    } else {
      setError('Invalid QR code format');
    }
  };

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <Card>
            <Card.Body>
              <h2 className="mb-4 text-center">QR Code Scanner</h2>
              <p className="text-center text-muted mb-4">
                Scan a QR code from a Lost & Found item to view its details
              </p>
              
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              
              <div className="qr-scanner-container mb-4">
                <div id="qr-reader" style={{ width: '100%' }}></div>
              </div>
              
              <div className="text-center">
                {!isScanning ? (
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={startScanning}
                  >
                    📷 Start Camera Scanner
                  </Button>
                ) : (
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={stopScanning}
                  >
                    ⏹️ Stop Scanner
                  </Button>
                )}
              </div>
              
              {scannedData && (
                <Alert variant="success" className="mt-4">
                  <h6>Scanned Data:</h6>
                  <code>{scannedData}</code>
                </Alert>
              )}
              
              <div className="mt-4 p-3 bg-light rounded">
                <h6>How it works:</h6>
                <ol className="mb-0">
                  <li>Click "Start Camera Scanner" to activate your camera</li>
                  <li>Point your camera at a Lost & Found QR code</li>
                  <li>The scanner will automatically detect and process the code</li>
                  <li>You'll be redirected to the item's details page</li>
                </ol>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default QRScanner;