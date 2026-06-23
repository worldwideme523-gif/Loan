# FoyerLibre Frontend

A modern React application for a cryptocurrency lending platform built with Vite, React Router, TailwindCSS, and Axios.

## Features

- **User Authentication**: Secure login and registration system
- **Loan Management**: Apply for loans, track applications, and manage repayments
- **Admin Dashboard**: Manage users, approve loans, and verify repayments
- **Crypto Wallet Integration**: Integrate with external crypto wallets
- **Responsive Design**: Mobile-friendly UI with TailwindCSS
- **Error Handling**: Global error boundaries and notification system
- **API Integration**: Centralized axios configuration with interceptors

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

## Installation

1. **Clone the repository** (if not already done):
```bash
git clone <repository-url>
cd Frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
```bash
cp .env.example .env.local
```

Then edit `.env.local` with your configuration:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_CRYPTO_REPAYMENT_ADDRESS=your_wallet_address_here
VITE_ENV=development
```

## Development

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Hot Module Replacement (HMR)

Changes to your code will be reflected instantly in the browser without full page refresh.

## Building

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Linting

### Run ESLint

```bash
npm run lint
```

This checks your code against the configured ESLint rules and can help catch potential issues.

## Project Structure

```
src/
├── components/
│   ├── pages/              # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── AdminLogin.jsx
│   │   ├── UserDashboard.jsx
│   │   └── AdminDashboard.jsx
│   ├── ProtectedRoute.jsx  # Route guard for authenticated users
│   ├── AdminRoute.jsx      # Route guard for admin users
│   ├── ErrorBoundary.jsx   # Error boundary component
│   ├── NotificationContainer.jsx
│   ├── CountdownTimer.jsx
│   └── LoanCalculator.jsx
├── contexts/
│   ├── AuthContext.jsx          # Authentication context
│   └── NotificationContext.jsx   # Notification system
├── config/
│   └── axios.js            # Axios configuration with interceptors
├── App.jsx                 # Main app component
├── main.jsx               # Entry point
└── index.css              # Global styles
```

## Key Components

### Authentication
- **AuthContext**: Manages user authentication state, login, register, and logout
- **ProtectedRoute**: Guards routes that require authentication
- **AdminRoute**: Guards routes that require admin privileges

### Error Handling
- **ErrorBoundary**: Catches React component errors and displays fallback UI
- **NotificationContext & NotificationContainer**: Toast notification system for user feedback

### API Communication
- **axios.js**: Centralized API configuration with:
  - Base URL configuration via environment variables
  - Request/response interceptors
  - Automatic token injection
  - Automatic logout on 401 errors

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Technologies Used

- **React 19**: UI framework
- **Vite**: Build tool and dev server
- **React Router v7**: Client-side routing
- **TailwindCSS**: Utility-first CSS framework
- **Axios**: HTTP client
- **Lucide React**: Icon library
- **Recharts**: Data visualization library

## Configuration Files

- **vite.config.js**: Vite configuration
- **eslint.config.js**: ESLint configuration
- **.env.example**: Environment variables template
- **.gitignore**: Git ignore rules

## API Integration

The frontend communicates with a backend API. Ensure the backend server is running on the URL configured in your `.env.local`:

```
VITE_API_BASE_URL=http://localhost:5000
```

The API endpoints used:
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/user/dashboard` - Get user dashboard data
- `GET /api/loan/my-applications` - Get loan applications
- `POST /api/loan/apply` - Apply for a loan
- `GET /api/admin/users` - Get all users (admin)
- `GET /api/admin/applications` - Get all loan applications (admin)
- `POST /api/admin/approve-loan/:id` - Approve a loan (admin)
- `POST /api/admin/deny-loan/:id` - Deny a loan (admin)
- And more...

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**:
   - Run `npm install` to ensure all dependencies are installed
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

2. **API connection errors**:
   - Ensure backend server is running on the configured API_BASE_URL
   - Check network tab in browser DevTools
   - Verify CORS is enabled on backend

3. **Hot reload not working**:
   - Restart the development server: `npm run dev`
   - Check that no firewall is blocking port 5173

4. **Build failures**:
   - Check console for specific errors
   - Ensure all imports are correct
   - Run ESLint to find issues: `npm run lint`

## Best Practices

1. **Authentication**: Never store sensitive data in localStorage except JWT tokens
2. **Error Handling**: Always handle API errors gracefully using the notification system
3. **Components**: Keep components small and focused on single responsibility
4. **State Management**: Use Context API for global state (auth, notifications)
5. **Styling**: Use TailwindCSS utility classes for consistent styling

## Security Notes

- Never commit `.env.local` file (included in `.gitignore`)
- Always use HTTPS in production
- Implement CSRF protection on the backend
- Validate all user input on both frontend and backend
- Use secure password storage (bcrypt) on backend
- Implement rate limiting on API endpoints

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run `npm run lint` to check code quality
4. Commit your changes
5. Push to the repository
6. Create a pull request

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please create an issue in the repository or contact the development team.
