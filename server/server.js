const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dirs = ['uploads', 'qrcodes'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/qrcodes', express.static(path.join(__dirname, 'qrcodes')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});

const db = new sqlite3.Database('./lost_found.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      unique_id TEXT UNIQUE NOT NULL,
      image_path TEXT,
      qr_code_path TEXT,
      lat REAL,
      lon REAL,
      status TEXT CHECK(status IN ('lost', 'found', 'claimed')) NOT NULL,
      category TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.run(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Items table ready.');
    }
  });
}


io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
}


app.post('/api/items', upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, status, lat, lon } = req.body;
    let { unique_id } = req.body;
    
    if (!unique_id || unique_id.trim() === '') {
      unique_id = uuidv4();
    }
    
    const image_path = req.file ? req.file.filename : null;
    
    const qr_filename = `qr_${unique_id.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    const qr_code_path = path.join('qrcodes', qr_filename);
    
    const qrData = `${unique_id}|http://localhost:3000/item/${unique_id}`;
    
    await QRCode.toFile(qr_code_path, qrData, {
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 200
    });
    
    const insertQuery = `
      INSERT INTO items (name, description, unique_id, image_path, qr_code_path, lat, lon, status, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(insertQuery, [
      name, description, unique_id, image_path, qr_filename, 
      parseFloat(lat) || null, parseFloat(lon) || null, status, category
    ], function(err) {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }
      
      db.get('SELECT * FROM items WHERE id = ?', [this.lastID], (err, item) => {
        if (err) {
          return res.status(500).json({ error: 'Error retrieving created item' });
        }
        
        io.emit('newItem', item);
        
        res.status(201).json({
          message: 'Item created successfully',
          item: item
        });
      });
    });
    
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/items', (req, res) => {
  const { keyword, unique_id, lat, lon, radius, status, category } = req.query;
  
  let query = 'SELECT * FROM items WHERE 1=1';
  let params = [];
  
  if (keyword) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  
  if (unique_id) {
    query += ' AND unique_id = ?';
    params.push(unique_id);
  }
  
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY created_at DESC';
  
  db.all(query, params, (err, items) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (lat && lon && radius) {
      const userLat = parseFloat(lat);
      const userLon = parseFloat(lon);
      const searchRadius = parseFloat(radius);
      
      items = items.filter(item => {
        if (item.lat && item.lon) {
          const distance = calculateDistance(userLat, userLon, item.lat, item.lon);
          return distance <= searchRadius;
        }
        return true; 
      });
    }
    
    res.json(items);
  });
});

app.get('/api/items/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM items WHERE id = ?', [id], (err, item) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  });
});

app.get('/api/items/by-unique-id/:unique_id', (req, res) => {
  const { unique_id } = req.params;
  
  db.get('SELECT * FROM items WHERE unique_id = ?', [unique_id], (err, item) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  });
});

app.put('/api/items/:id/claim', (req, res) => {
  const { id } = req.params;
  
  db.run('UPDATE items SET status = ? WHERE id = ?', ['claimed', id], function(err) {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    db.get('SELECT * FROM items WHERE id = ?', [id], (err, item) => {
      if (!err && item) {
        io.emit('itemClaimed', item);
      }
    });
    
    res.json({ message: 'Item marked as claimed' });
  });
});

app.get('/api/categories', (req, res) => {
  const categories = [
    'Electronics',
    'Clothing',
    'Documents',
    'Jewelry',
    'Books',
    'Keys',
    'Bags',
    'Sports Equipment',
    'Toys',
    'Other'
  ];
  
  res.json(categories);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Lost & Found API is running' });
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`Lost & Found API server running on port ${PORT}`);
  console.log(`Static files served from:`);
  console.log(`  - Images: http://localhost:${PORT}/uploads/`);
  console.log(`  - QR Codes: http://localhost:${PORT}/qrcodes/`);
});

process.on('SIGTERM', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
  });
});