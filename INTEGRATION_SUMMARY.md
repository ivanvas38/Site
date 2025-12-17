# Frontend/Backend Integration Summary

## Overview

This document describes the complete integration of the React frontend with the Express backend for authentication with JWT tokens, localStorage persistence, and protected routes.

## Architecture

### Frontend (React + TypeScript)

**Key Components:**
- `AuthContext.tsx` - Central state management for authentication
- `NavigationContext.tsx` - Navigation state management
- `PrivateRoute.tsx` - Protected route wrapper component
- `LoginPage.tsx` - User login form
- `RegisterPage.tsx` - User registration form
- `DashboardPage.tsx` - Protected user profile page
- `LandingPage.tsx` - Public landing page

**API Client:**
- `src/utils/api.ts` - Centralized API wrapper with:
  - Automatic JWT token injection to Authorization header
  - Error handling and response unwrapping
  - Type-safe API methods via TypeScript interfaces

### Backend (Express + SQLite/MySQL)

**Key Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile (requires token)
- `GET /api/auth/profile` - Alias for `/me`
- `GET /api/auth/validate` - Validate JWT token

**Database:**
- SQLite (default for development)
- MySQL support (production ready)
- Users table with email/username uniqueness constraints

## Authentication Flow

### Registration Flow

1. User fills registration form
2. Client validates input (email, username, password requirements)
3. Form submission calls `register()` from `AuthContext`
4. `AuthContext` calls `authApi.register()`
5. API wrapper sends POST request to `/api/auth/register`
6. Backend validates input, hashes password, creates user
7. Backend returns JWT token and user data
8. Client stores token in localStorage
9. Client sets user in state via `setUser()`
10. Component redirects to dashboard
11. Dashboard is protected by `PrivateRoute` which checks authentication

### Login Flow

1. User enters email and password
2. Client validates input
3. Form submission calls `login()` from `AuthContext`
4. `AuthContext` calls `authApi.login()`
5. API wrapper sends POST request to `/api/auth/login`
6. Backend validates credentials, compares password hash
7. Backend returns JWT token and user data
8. Client stores token in localStorage
9. Client sets user in state
10. Component redirects to dashboard
11. All subsequent API requests include Authorization header with token

### Session Restoration Flow

1. App initializes
2. `AuthProvider` mounts
3. `useEffect` calls `restoreSession()`
4. `restoreSession()` checks localStorage for token
5. If token exists, calls `authApi.getCurrentUser()`
6. API wrapper includes token in Authorization header
7. Backend validates token via `authenticateToken` middleware
8. Backend returns user data
9. Client sets user in state
10. User is immediately available without re-login
11. If token invalid or expired, it's cleared from localStorage

### Logout Flow

1. User clicks logout button
2. Calls `logout()` from `AuthContext`
3. `logout()` clears user state and localStorage
4. Component redirects to landing page
5. Next navigation attempt to protected route redirects to login

## Protected Routes

### PrivateRoute Component

```typescript
<PrivateRoute>
  <DashboardPage />
</PrivateRoute>
```

The `PrivateRoute` component:
- Checks `isAuthenticated` from `AuthContext`
- Shows loading state while checking session
- Redirects to login if not authenticated
- Renders children if authenticated

## State Management

### AuthContext State

```typescript
interface AuthContextType {
  user: User | null                           // Current user data
  isAuthenticated: boolean                     // Derived from user !== null
  isLoading: boolean                           // True during async operations
  error: string | null                         // Last error message
  login: (email, password, rememberMe?) => Promise<void>
  register: (email, username, password) => Promise<void>
  logout: () => void
  clearError: () => void
  restoreSession: () => Promise<void>
}
```

### NavigationContext State

```typescript
type PageType = 'landing' | 'login' | 'register' | 'dashboard'

interface NavigationContextType {
  currentPage: PageType
  navigate: (page: PageType) => void
}
```

## API Integration Points

### Token Storage

- **Key:** `token` in localStorage
- **Value:** JWT token from backend
- **Used:** Automatically added to Authorization header for all API requests

### API Response Format

Backend returns:
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "username": "..." },
    "token": "eyJhbGc..."
  },
  "message": "Success"
}
```

Frontend wrapper extracts `data` field and normalizes to:
```typescript
ApiResponse<LoginResponse> {
  success: true,
  data: {
    user: { id, email, username },
    token: "eyJhbGc..."
  }
}
```

### Error Handling

- Backend errors include `message` field
- API wrapper extracts message from error responses
- Frontend displays user-friendly error messages
- Errors auto-clear when user starts typing in form fields

## Security Considerations

1. **Token Storage:** JWT tokens stored in localStorage
   - Accessible to XSS attacks
   - Consider moving to httpOnly cookies in production
   
2. **Password Validation:** 
   - Client-side: UI validation for UX
   - Server-side: Strict validation via express-validator
   - Passwords hashed with bcrypt (12 rounds)

3. **JWT Verification:**
   - Tokens signed with secret key
   - Backend verifies signature on every protected request
   - Tokens expire after 24 hours

4. **CORS:**
   - Backend has CORS enabled for development
   - Configure for specific origins in production

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

### Backend (.env)
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=backend_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

## Error Messages (Russian)

- "Ошибка подключения к серверу" - Connection error
- "Ошибка входа" - Login error
- "Ошибка регистрации" - Registration error
- "Неверные учетные данные" - Invalid credentials
- "Неверный пароль" - Wrong password
- "Пользователь с таким email уже существует" - Email taken
- "Пользователь с таким username уже существует" - Username taken
- "Неверный ответ сервера" - Invalid server response

## Form Validation Rules

### Email
- Must be valid email format
- Required field

### Password
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain digit

### Username
- Minimum 3 characters
- Only alphanumeric and underscore allowed

## Development Notes

1. **Hot Reload:** Frontend uses Vite with fast refresh
2. **Backend Changes:** Requires server restart
3. **Database:** SQLite persists in memory during dev session
4. **API Testing:** Use provided API_TESTS.md in backend folder

## Future Improvements

1. Move JWT token to httpOnly cookie
2. Implement refresh token rotation
3. Add password reset functionality
4. Add email verification
5. Implement rate limiting
6. Add 2FA support
7. Move to persistent database (PostgreSQL)
