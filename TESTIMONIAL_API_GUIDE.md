# Testimonial API Guide

## Overview
The testimonial system has been fully implemented with complete frontend-backend sync. The testimonials are displayed on the Home page and include comprehensive admin management capabilities.

## API Endpoints

### Public Endpoints

#### Get All Active Testimonials
- **Route**: `GET /api/testimonials`
- **Authentication**: None (Public)
- **Description**: Fetches all active testimonials from the database
- **Response**: Array of testimonial objects
- **Example Response**:
```json
[
  {
    "_id": "6a114a55f7a0fb44f0049896",
    "author": "Emily R.",
    "content": "Quick approval and excellent customer support.",
    "rating": 5,
    "loanAmount": 1500000,
    "isActive": true,
    "createdAt": "2026-05-23T06:33:57.307Z"
  }
]
```

### Admin Endpoints (Requires Authentication & Admin Role)

#### Seed Testimonials (Setup Only)
- **Route**: `POST /api/testimonials/seed`
- **Authentication**: None (First-time setup)
- **Description**: Seeds the database with initial testimonial data
- **Request Body**: None

#### Create Testimonial
- **Route**: `POST /api/testimonials/create`
- **Authentication**: Required (Bearer Token + Admin role)
- **Description**: Creates a new testimonial
- **Request Body**:
```json
{
  "author": "John Smith",
  "content": "Great service and fast processing!",
  "rating": 5,
  "loanAmount": 1000000,
  "isActive": true
}
```
- **Required Fields**: author, content, rating
- **Optional Fields**: loanAmount, isActive (defaults to true)

#### Update Testimonial
- **Route**: `PUT /api/testimonials/:id`
- **Authentication**: Required (Bearer Token + Admin role)
- **Description**: Updates an existing testimonial
- **URL Parameters**: `:id` - MongoDB testimonial ID
- **Request Body**: Same as create (all fields optional)

#### Delete Testimonial
- **Route**: `DELETE /api/testimonials/:id`
- **Authentication**: Required (Bearer Token + Admin role)
- **Description**: Deletes a testimonial
- **URL Parameters**: `:id` - MongoDB testimonial ID

## Frontend Implementation

### Home Page Integration
The Home component (`src/components/pages/Home.jsx`) includes:

1. **State Management**:
   - `testimonials`: Array of testimonial objects
   - `loadingTestimonials`: Boolean for loading state

2. **Data Fetching**:
   - Uses `axiosInstance` to fetch from `/api/testimonials`
   - Auto-seeds database if empty
   - Includes error handling and logging

3. **Display Features**:
   - Shows testimonials in a responsive grid (4 columns on desktop, 2 on tablet, 1 on mobile)
   - Displays star ratings (★/☆)
   - Shows author name and loan amount
   - Loading state with "Loading testimonials..." message
   - Empty state message if no testimonials exist

## Database Model

```javascript
{
  author: String (required),
  content: String (required),
  rating: Number (1-5, default: 5),
  loanAmount: Number (optional),
  isActive: Boolean (default: true),
  createdAt: Date (auto-generated)
}
```

## Testing the Testimonials

### 1. Verify Backend API
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/testimonials" -Method Get
```

### 2. Verify Frontend Display
1. Open `http://localhost:5174` (or your frontend URL)
2. Scroll to the "Success Stories" section on the Home page
3. Check browser console (F12) for debug logs
4. You should see testimonials displayed in a grid

### 3. Add New Testimonial (Admin Only)
```powershell
$body = @{
  author = "Test User"
  content = "Excellent service!"
  rating = 5
  loanAmount = 2000000
  isActive = $true
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/testimonials/create" `
  -Method Post `
  -Headers @{"Authorization" = "Bearer YOUR_ADMIN_TOKEN"; "Content-Type" = "application/json"} `
  -Body $body
```

## Troubleshooting

### Testimonials Not Showing on Frontend
1. Check browser console for errors (F12)
2. Verify backend is running (`npm start` in Backend folder)
3. Check CORS settings in `Backend/server.js`
4. Verify MongoDB connection
5. Check that axios baseURL is correctly configured in `Frontend/src/config/axios.js`

### API Errors
- **404 Not Found**: Check route spelling and ensure backend is running
- **401 Unauthorized**: Admin endpoints require valid authentication token
- **403 Forbidden**: Admin endpoints require user to have admin/superadmin role
- **500 Server Error**: Check backend logs and database connection

## Auto-Seeding
The system automatically seeds the database with sample testimonials if:
- The database is empty on first request to `/api/testimonials`
- The seed is triggered manually via `POST /api/testimonials/seed`

Sample data includes testimonials from:
- John D. (5 stars, $500,000)
- Sarah M. (5 stars, $2,000,000)
- Michael K. (4 stars, $750,000)
- Emily R. (5 stars, $1,500,000)

## Recent Changes & Fixes

✅ **Fixed Frontend-Backend Sync**:
1. Added proper error handling in testimonial fetching
2. Uses MongoDB `_id` as React key (was using index)
3. Added loading state for better UX
4. Enhanced console logging for debugging
5. Fixed header text color for dark background
6. Added empty state message

✅ **Enhanced Backend**:
1. Improved error responses with HTTP status codes
2. Added `.lean()` for query performance
3. Added admin endpoints for CRUD operations
4. Integrated authentication middleware for admin routes
5. Added comprehensive validation

✅ **Better Admin Management**:
1. Create, Update, and Delete testimonials
2. Admin-only access to modification endpoints
3. Input validation (rating: 1-5)
4. Proper error messages

## Environment Variables Required
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT secret for authentication
- `PORT`: Server port (default: 5000)

For frontend:
- `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:5000)
