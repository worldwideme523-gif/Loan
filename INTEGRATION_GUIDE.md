# FoyerLibre Platform - Frontend & Backend Integration Guide

## ✅ Fixed Issues

### 1. **Axios Configuration (CRITICAL - FIXED)**
**Problem:** Home.jsx, AdminDashboard.jsx, and UserDashboard.jsx were importing `axios` directly instead of using the configured `axiosInstance`.

**Impact:** 
- API base URL not applied to requests
- Auth interceptors bypassed
- 401 response handling not working
- CORS configuration not being used

**Solution Applied:** ✅
- Updated all three components to import `axiosInstance` from `../../config/axios`
- All API calls now properly use the configured interceptors
- Token is automatically added to request headers
- CORS and base URL are properly configured

---

## 📋 Current Architecture

### Backend (Express.js + MongoDB)
```
Backend/
├── server.js                 # Main server file (PORT 5000)
├── .env                      # Configuration (MongoDB URI, JWT_SECRET, etc)
├── routes/                   # API endpoints
│   ├── auth.js              # Authentication routes
│   ├── user.js              # User routes
│   ├── loan.js              # Loan management
│   ├── repayment.js         # Repayment handling
│   ├── testimonial.js       # Testimonials
│   └── crypto.js            # Crypto prices API
├── controller/              # Request handlers
├── models/                  # MongoDB schemas
├── middleware/              # Auth, error handling, validation
└── uploads/                 # File storage
```

### Frontend (React + Vite)
```
Frontend/
├── vite.config.js           # Vite configuration (PORT 5174)
├── .env                     # VITE_API_BASE_URL=http://localhost:5000
├── src/
│   ├── config/
│   │   └── axios.js         # Configured axios instance with interceptors
│   ├── contexts/
│   │   ├── AuthContext.jsx  # Authentication state management
│   │   └── NotificationContext.jsx
│   ├── components/pages/
│   │   ├── Home.jsx         # Landing page (testimonials + crypto)
│   │   ├── Login.jsx        # User login
│   │   ├── Register.jsx     # User registration
│   │   ├── UserDashboard.jsx # User's main dashboard
│   │   ├── AdminDashboard.jsx # Admin panel
│   │   └── AdminLogin.jsx   # Admin login
│   └── components/
│       ├── ProtectedRoute.jsx # Auth-required routes
│       ├── AdminRoute.jsx     # Admin-required routes
│       └── LoanCalculator.jsx
```

---

## 🔌 API Integration Points

### 1. **Authentication Flow**
```
Frontend (AuthContext)
  ↓
axios.post('/api/auth/login')
  ↓
Backend (authController.js)
  ↓
Returns: { token, user }
  ↓
Frontend stores token in localStorage
```

**Key Features:**
- JWT token stored in localStorage
- Token auto-added to all subsequent requests via interceptor
- 401 response triggers logout and redirect to /login
- Register also creates JWT token automatically

---

### 2. **Testimonials Integration** 🎤

**Backend Endpoint:** `GET /api/testimonials`
- Returns up to 6 most recent active testimonials
- Sorted by creation date (newest first)

**Seeding Testimonials:**
```bash
# Make a POST request to seed initial testimonials
curl -X POST http://localhost:5000/api/testimonials/seed
```

**Frontend Display:** Home.jsx
- Fetches testimonials on component mount
- Displays rating stars (★☆)
- Shows author, content, and loan amount

**Database Schema (MongoDB):**
```javascript
{
  author: String,           // e.g., "John D."
  content: String,          // Customer review text
  rating: Number (1-5),    // Star rating
  loanAmount: Number,       // Loan amount in USD
  isActive: Boolean,        // Show/hide testimonial
  createdAt: Date          // Auto-set timestamp
}
```

---

### 3. **Crypto Prices Integration** 💰

**Backend Endpoint:** `GET /api/crypto/prices`
- Fetches live data from CoinGecko API
- Returns: Bitcoin, Ethereum, Solana prices in USD
- Includes 24-hour change percentage

**Frontend Display:** Home.jsx
- Updates on page load
- Shows current price and 24h change
- Color-coded (green for +, red for -)

**Returned Data Format:**
```javascript
{
  bitcoin: {
    usd: 45000.50,
    change24h: 2.45
  },
  ethereum: {
    usd: 2800.75,
    change24h: 1.20
  },
  solana: {
    usd: 150.30,
    change24h: -0.50
  }
}
```

---

## 🚀 Setup Instructions

### 1. **Backend Setup**

```bash
cd Backend
npm install
```

**Configure .env file:**
```
PORT=5000
MONGODB_URI=mongodb+srv://your_user:your_pass@cluster.mongodb.net/?appName=app_name
JWT_SECRET=your_super_secret_key
ADMIN_EMAIL=admin@example.com
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

**Start Backend:**
```bash
npm run dev    # With nodemon for development
# OR
npm run start  # Production
```

✅ Backend should be running on http://localhost:5000

---

### 2. **Frontend Setup**

```bash
cd Frontend
npm install
```

**Verify .env configuration:**
```
VITE_API_BASE_URL=http://localhost:5000
VITE_CRYPTO_REPAYMENT_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9
```

**Start Frontend:**
```bash
npm run dev
```

✅ Frontend should be accessible at http://localhost:5174

---

### 3. **Seed Initial Data**

**Seed Testimonials:**
```bash
# Option 1: Using curl
curl -X POST http://localhost:5000/api/testimonials/seed

# Option 2: From browser console
fetch('http://localhost:5000/api/testimonials/seed', { method: 'POST' })
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## 🔒 CORS Configuration

**Backend (server.js):**
```javascript
app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true
}));
```

✅ Frontend can make cross-origin requests to backend

---

## 📡 Request/Response Examples

### Get Testimonials
```javascript
// Frontend
axiosInstance.get('/api/testimonials')
  .then(res => console.log(res.data))

// Response
[
  {
    _id: "...",
    author: "John D.",
    content: "Great service!",
    rating: 5,
    loanAmount: 500000,
    isActive: true,
    createdAt: "2026-04-30T..."
  },
  ...
]
```

### Get Crypto Prices
```javascript
// Frontend
axiosInstance.get('/api/crypto/prices')
  .then(res => console.log(res.data))

// Response
{
  bitcoin: { usd: 45000.50, change24h: 2.45 },
  ethereum: { usd: 2800.75, change24h: 1.20 },
  solana: { usd: 150.30, change24h: -0.50 }
}
```

---

## 🧪 Testing Checklist

- [x] Backend server starts on port 5000
- [x] Frontend builds and runs on port 5174
- [x] Home page loads without errors
- [x] Testimonials fetch successfully
- [x] Crypto prices fetch successfully
- [x] Login/Register authentication works
- [ ] Seed testimonials into database (run curl command)
- [ ] User dashboard loads with token
- [ ] Admin dashboard loads with admin privileges
- [ ] Loan application form submits
- [ ] API requests use proper interceptors
- [ ] 401 responses trigger logout

---

## 🐛 Troubleshooting

### Issue: API calls return 404 or CORS error
**Solution:** 
- Verify backend is running on port 5000
- Check `VITE_API_BASE_URL` in Frontend/.env
- Ensure CORS is configured in backend

### Issue: Testimonials don't show
**Solution:**
- Run seed command: `curl -X POST http://localhost:5000/api/testimonials/seed`
- Check browser console for API errors
- Verify MongoDB connection in backend

### Issue: Crypto prices show $0
**Solution:**
- Check internet connection (CoinGecko API requires live access)
- Verify backend can access external APIs
- Check browser console for errors

### Issue: Token not being sent with requests
**Solution:**
- Verify token is stored in localStorage after login
- Check that components use `axiosInstance` not `axios`
- Clear localStorage and re-login

---

## 📞 Support

For issues with:
- **Backend/APIs:** Check Backend controllers and routes
- **Frontend/UI:** Check Frontend components and styling
- **Database:** Check MongoDB connection in .env
- **Crypto Data:** Verify CoinGecko API availability

---

## 🎯 Next Steps

1. ✅ Fix axios configuration (DONE)
2. Seed testimonials database
3. Test full authentication flow
4. Test loan application workflow
5. Set up email notifications (Resend)
6. Configure payment processing
7. Deploy to production

---

**Last Updated:** April 30, 2026
**Status:** Integration Phase - Ready for Testing
