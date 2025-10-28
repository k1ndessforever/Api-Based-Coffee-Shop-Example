import React, { useState, useEffect } from 'react';
import { Coffee, ShoppingCart, CheckCircle, Server, Smartphone } from 'lucide-react';

// ============================================
// SIMULATED BACKEND (In real app, this would be separate Node.js server)
// ============================================
const SimulatedBackend = {
  // This represents the DATABASE
  database: {
    menu: [
      { id: 1, name: 'Espresso', price: 120, description: 'Strong and bold' },
      { id: 2, name: 'Cappuccino', price: 150, description: 'Creamy and smooth' },
      { id: 3, name: 'Latte', price: 160, description: 'Mild and milky' },
      { id: 4, name: 'Americano', price: 130, description: 'Classic black coffee' }
    ],
    orders: []
  },

  // API ENDPOINTS (These would be actual routes like /api/menu, /api/orders)
  
  // GET /api/menu - Returns all menu items
  getMenu: function() {
    console.log('📡 API REQUEST: GET /api/menu');
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('✅ API RESPONSE: 200 OK', this.database.menu);
        resolve({
          status: 200,
          data: this.database.menu
        });
      }, 500);
    });
  },

  // POST /api/orders - Creates new order
  createOrder: function(orderData) {
    console.log('📡 API REQUEST: POST /api/orders', orderData);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Validate data (backend security)
        if (!orderData.customerName || !orderData.items) {
          console.log('❌ API RESPONSE: 400 Bad Request');
          resolve({
            status: 400,
            error: 'Missing required fields'
          });
          return;
        }

        // Save to database
        const newOrder = {
          id: this.database.orders.length + 1,
          ...orderData,
          timestamp: new Date().toISOString(),
          status: 'pending'
        };
        this.database.orders.push(newOrder);
        
        console.log('✅ API RESPONSE: 201 Created', newOrder);
        resolve({
          status: 201,
          data: newOrder
        });
      }, 800);
    });
  },

  // GET /api/orders - Returns all orders
  getOrders: function() {
    console.log('📡 API REQUEST: GET /api/orders');
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('✅ API RESPONSE: 200 OK', this.database.orders);
        resolve({
          status: 200,
          data: this.database.orders
        });
      }, 500);
    });
  }
};

// ============================================
// FRONTEND - Coffee Shop Website
// ============================================
export default function CoffeeShopApp() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('menu');
  const [apiLog, setApiLog] = useState([]);

  // Intercept console.log to show API calls
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      if (args[0]?.includes('API')) {
        setApiLog(prev => [...prev, args.join(' ')]);
      }
    };
    return () => { console.log = originalLog; };
  }, []);

  // Load menu when component mounts (like page load)
  useEffect(() => {
    loadMenu();
  }, []);

  // API CALL 1: Fetch Menu (GET request)
  const loadMenu = async () => {
    setLoading(true);
    try {
      // In real app: fetch('https://api.coffeeshop.com/api/menu')
      const response = await SimulatedBackend.getMenu();
      
      if (response.status === 200) {
        setMenu(response.data);
      }
    } catch (error) {
      alert('Error loading menu: ' + error.message);
    }
    setLoading(false);
  };

  // Add item to cart (frontend only, no API call yet)
  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  // API CALL 2: Submit Order (POST request)
  const submitOrder = async () => {
    if (!customerName) {
      alert('Please enter your name');
      return;
    }
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    setLoading(true);
    try {
      // Prepare data to send
      const orderData = {
        customerName,
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price, 0)
      };

      // In real app: fetch('https://api.coffeeshop.com/api/orders', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(orderData)
      // })
      const response = await SimulatedBackend.createOrder(orderData);

      if (response.status === 201) {
        alert('Order placed successfully! Order #' + response.data.id);
        setCart([]);
        setCustomerName('');
        loadOrders(); // Refresh orders
      } else {
        alert('Error: ' + response.error);
      }
    } catch (error) {
      alert('Error submitting order: ' + error.message);
    }
    setLoading(false);
  };

  // API CALL 3: Load Orders (GET request)
  const loadOrders = async () => {
    setLoading(true);
    try {
      // In real app: fetch('https://api.coffeeshop.com/api/orders')
      const response = await SimulatedBackend.getOrders();
      
      if (response.status === 200) {
        setOrders(response.data);
      }
    } catch (error) {
      alert('Error loading orders: ' + error.message);
    }
    setLoading(false);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <div className="bg-amber-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Coffee size={40} />
            <h1 className="text-3xl font-bold">The Daily Brew</h1>
          </div>
          <p className="text-amber-200">API-Powered Coffee Shop Demo</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 bg-white p-2 rounded-lg shadow">
              <button
                onClick={() => setActiveTab('menu')}
                className={`flex-1 py-2 px-4 rounded transition ${
                  activeTab === 'menu' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Menu
              </button>
              <button
                onClick={() => { setActiveTab('orders'); loadOrders(); }}
                className={`flex-1 py-2 px-4 rounded transition ${
                  activeTab === 'orders' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Orders
              </button>
            </div>

            {/* Menu Section */}
            {activeTab === 'menu' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-amber-900">Our Menu</h2>
                {loading && menu.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Loading menu...</div>
                ) : (
                  <div className="grid gap-4">
                    {menu.map(item => (
                      <div key={item.id} className="flex justify-between items-center border-b pb-4">
                        <div>
                          <h3 className="font-bold text-lg">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <p className="text-amber-700 font-semibold mt-1">₹{item.price}</p>
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders Section */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-amber-900">All Orders</h2>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No orders yet</div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="border rounded-lg p-4 bg-amber-50">
                        <div className="flex justify-between mb-2">
                          <span className="font-bold">Order #{order.id}</span>
                          <span className="text-sm text-gray-600">
                            {new Date(order.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm mb-2"><strong>Customer:</strong> {order.customerName}</p>
                        <p className="text-sm mb-2"><strong>Items:</strong></p>
                        <ul className="text-sm ml-4 mb-2">
                          {order.items.map((item, idx) => (
                            <li key={idx}>• {item.name} - ₹{item.price}</li>
                          ))}
                        </ul>
                        <p className="font-bold text-amber-700">Total: ₹{order.total}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Cart & API Log */}
          <div className="space-y-6">
            {/* Shopping Cart */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="text-amber-700" />
                <h2 className="text-xl font-bold">Your Cart</h2>
              </div>
              
              {cart.length === 0 ? (
                <p className="text-gray-500 text-sm">Cart is empty</p>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span>₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 mb-4">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-amber-700">₹{totalPrice}</span>
                    </div>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border rounded px-3 py-2 mb-3 text-sm"
                  />
                  
                  <button
                    onClick={submitOrder}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Place Order
                  </button>
                </>
              )}
            </div>

            {/* API Log */}
            <div className="bg-gray-900 text-green-400 rounded-lg shadow-lg p-4 font-mono text-xs">
              <div className="flex items-center gap-2 mb-3 text-white">
                <Server size={16} />
                <span className="font-bold">API Activity Log</span>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {apiLog.length === 0 ? (
                  <div className="text-gray-500">Waiting for API calls...</div>
                ) : (
                  apiLog.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Architecture Diagram */}
            <div className="bg-blue-50 rounded-lg p-4 text-xs">
              <h3 className="font-bold mb-3 text-blue-900">How It Works:</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Smartphone className="text-blue-600 mt-1" size={16} />
                  <div>
                    <strong>Frontend (React):</strong> User interface you see
                  </div>
                </div>
                <div className="text-center text-gray-500">↕️ API Calls (HTTP)</div>
                <div className="flex items-start gap-2">
                  <Server className="text-blue-600 mt-1" size={16} />
                  <div>
                    <strong>Backend (Node.js):</strong> Handles requests & database
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}