// ============================================
// BACKEND API - server.js
// This runs on a SERVER (not in browser)
// ============================================

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Allow frontend to connect

// In-memory database (in production, use MongoDB/PostgreSQL)
let database = {
  menu: [
    { id: 1, name: 'Espresso', price: 120, description: 'Strong and bold' },
    { id: 2, name: 'Cappuccino', price: 150, description: 'Creamy and smooth' },
    { id: 3, name: 'Latte', price: 160, description: 'Mild and milky' },
    { id: 4, name: 'Americano', price: 130, description: 'Classic black coffee' }
  ],
  orders: []
};

// ============================================
// API ENDPOINTS (Routes)
// ============================================

// GET /api/menu - Return all menu items
app.get('/api/menu', (req, res) => {
  console.log('📡 Received: GET /api/menu');
  
  // Return menu data as JSON
  res.status(200).json({
    success: true,
    data: database.menu
  });
});

// POST /api/orders - Create new order
app.post('/api/orders', (req, res) => {
  console.log('📡 Received: POST /api/orders');
  console.log('Request Body:', req.body);
  
  // Extract data from request
  const { customerName, items, total } = req.body;
  
  // SECURITY: Validate incoming data
  if (!customerName || !items || !Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: customerName, items'
    });
  }
  
  if (items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Order must contain at least one item'
    });
  }
  
  // Create new order object
  const newOrder = {
    id: database.orders.length + 1,
    customerName,
    items,
    total,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };
  
  // Save to database
  database.orders.push(newOrder);
  
  console.log('✅ Order created:', newOrder);
  
  // Send success response
  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: newOrder
  });
});

// GET /api/orders - Return all orders
app.get('/api/orders', (req, res) => {
  console.log('📡 Received: GET /api/orders');
  
  res.status(200).json({
    success: true,
    data: database.orders
  });
});

// GET /api/orders/:id - Get specific order
app.get('/api/orders/:id', (req, res) => {
  const orderId = parseInt(req.params.id);
  console.log(`📡 Received: GET /api/orders/${orderId}`);
  
  const order = database.orders.find(o => o.id === orderId);
  
  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: order
  });
});

// PUT /api/orders/:id - Update order status
app.put('/api/orders/:id', (req, res) => {
  const orderId = parseInt(req.params.id);
  const { status } = req.body;
  
  console.log(`📡 Received: PUT /api/orders/${orderId}`);
  
  const orderIndex = database.orders.findIndex(o => o.id === orderId);
  
  if (orderIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }
  
  // Valid statuses
  const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status'
    });
  }
  
  database.orders[orderIndex].status = status;
  
  res.status(200).json({
    success: true,
    message: 'Order updated',
    data: database.orders[orderIndex]
  });
});

// DELETE /api/orders/:id - Cancel/delete order
app.delete('/api/orders/:id', (req, res) => {
  const orderId = parseInt(req.params.id);
  console.log(`📡 Received: DELETE /api/orders/${orderId}`);
  
  const orderIndex = database.orders.findIndex(o => o.id === orderId);
  
  if (orderIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }
  
  database.orders.splice(orderIndex, 1);
  
  res.status(200).json({
    success: true,
    message: 'Order deleted successfully'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Coffee Shop API running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET    /api/menu`);
  console.log(`   POST   /api/orders`);
  console.log(`   GET    /api/orders`);
  console.log(`   GET    /api/orders/:id`);
  console.log(`   PUT    /api/orders/:id`);
  console.log(`   DELETE /api/orders/:id`);
});

// ============================================
// HOW TO RUN THIS:
// ============================================
// 1. Install Node.js from nodejs.org
// 2. Create a folder and save this as server.js
// 3. Open terminal in that folder
// 4. Run: npm init -y
// 5. Run: npm install express cors
// 6. Run: node server.js
// 7. Server starts at http://localhost:3000
// ============================================