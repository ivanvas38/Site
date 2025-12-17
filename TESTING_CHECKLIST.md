# Testing Checklist - Frontend/Backend Integration

## Prerequisites

1. **Start Backend Server**
   ```bash
   cd backend
   npm install
   npm start
   ```
   Backend should run on http://localhost:3000

2. **Start Frontend Server**
   ```bash
   npm install
   npm run dev
   ```
   Frontend should run on http://localhost:5173

3. **Check Environment Variables**
   - Frontend `.env` should have: `VITE_API_URL=http://localhost:3000/api`
   - Backend uses SQLite by default (in-memory database during development)

## Test Cases

### 1. Registration with New Account
- [ ] Navigate to `/register`
- [ ] Fill form with:
  - Email: `test@example.com`
  - Username: `testuser123`
  - Password: `TestPass123` (8+ chars, uppercase, lowercase, digit)
  - Confirm Password: `TestPass123`
- [ ] Submit form
- [ ] Verify loading state shows during submission
- [ ] Verify success message appears
- [ ] Verify automatic redirect to dashboard
- [ ] Verify JWT token is saved in localStorage

### 2. Duplicate Email Error Handling
- [ ] Try to register with same email again
- [ ] Verify error message: "Пользователь с таким email уже существует"
- [ ] Verify error is displayed in the form
- [ ] Verify user can dismiss error and try again

### 3. Duplicate Username Error Handling
- [ ] Try to register with different email but same username
- [ ] Verify error message: "Пользователь с таким username уже существует"
- [ ] Verify error is displayed and handled correctly

### 4. Login with Correct Credentials
- [ ] Navigate to `/login`
- [ ] Enter the email and password from test case 1
- [ ] Submit form
- [ ] Verify loading state shows during submission
- [ ] Verify success message appears
- [ ] Verify automatic redirect to dashboard
- [ ] Verify JWT token is saved in localStorage

### 5. Login with Incorrect Password
- [ ] Navigate to `/login`
- [ ] Enter correct email but wrong password
- [ ] Submit form
- [ ] Verify error message: "Неверный пароль"
- [ ] Verify error is displayed
- [ ] Verify user is NOT redirected
- [ ] Verify user can try again

### 6. Login with Non-existent Email
- [ ] Navigate to `/login`
- [ ] Enter non-existent email and any password
- [ ] Submit form
- [ ] Verify error message: "Неверные учетные данные"
- [ ] Verify error is displayed

### 7. Protected Route (Dashboard Access)
- [ ] After successful login, verify you're on dashboard
- [ ] Verify user info is displayed (username, email, id)
- [ ] Verify dashboard shows a "Logout" button
- [ ] Try to manually navigate to `/dashboard` while logged in
- [ ] Verify dashboard loads without redirect

### 8. Protected Route - Unauthorized Access
- [ ] Clear localStorage (remove token)
- [ ] Manually navigate to `/dashboard`
- [ ] Verify automatic redirect to `/login`
- [ ] Verify loading state shows briefly during check

### 9. Session Persistence
- [ ] Login to the app
- [ ] Verify token is in localStorage
- [ ] Refresh the page (F5 or Cmd+R)
- [ ] Verify user stays logged in
- [ ] Verify dashboard loads without re-login required
- [ ] Verify user info is still visible

### 10. Session Persistence - Invalid Token
- [ ] Login to the app
- [ ] Open browser DevTools
- [ ] Modify the token in localStorage to an invalid value
- [ ] Refresh the page
- [ ] Verify invalid token is cleared
- [ ] Verify user is redirected to login
- [ ] Verify localStorage is cleaned up

### 11. Logout Functionality
- [ ] Login to the app
- [ ] Navigate to dashboard
- [ ] Click "Logout" button
- [ ] Verify token is removed from localStorage
- [ ] Verify user is redirected to landing page
- [ ] Verify navigation bar shows "Регистрация" and "Авторизация" buttons
- [ ] Verify you cannot manually access dashboard without re-login

### 12. Landing Page Behavior
- [ ] When not authenticated:
  - [ ] Navigation shows "Авторизация" and "Регистрация" buttons
  - [ ] Clicking buttons navigates to respective pages
- [ ] When authenticated:
  - [ ] Navigation shows "Привет, {username}!" greeting
  - [ ] Navigation shows "Профиль" button
  - [ ] Clicking "Профиль" navigates to dashboard
  - [ ] Can still access other pages

### 13. Form Validation - Client Side
- [ ] Register page - empty fields show errors
- [ ] Register page - invalid email shows error
- [ ] Register page - password < 8 chars shows error
- [ ] Register page - password without uppercase shows error
- [ ] Register page - password without lowercase shows error
- [ ] Register page - password without digits shows error
- [ ] Register page - mismatched confirm password shows error
- [ ] Username < 3 chars shows error
- [ ] Username with invalid chars shows error

### 14. Loading States
- [ ] During login/register submission:
  - [ ] Submit button is disabled
  - [ ] Submit button shows loading spinner
  - [ ] Submit button shows loading text
- [ ] After successful submission:
  - [ ] Button shows success state with checkmark
  - [ ] Automatic redirect happens after 2 seconds

### 15. Error Message Clearing
- [ ] Register with invalid data
- [ ] Verify error appears
- [ ] Start typing in a field that has an error
- [ ] Verify error clears as you type
- [ ] Fix the field and verify no error

## Expected Results

All test cases should pass with:
- ✅ Proper API communication between frontend and backend
- ✅ JWT tokens properly saved and used
- ✅ Session persistence across page reloads
- ✅ Proper redirects after authentication
- ✅ Correct error handling and messaging
- ✅ Loading states during async operations
- ✅ Protected routes preventing unauthorized access
- ✅ Logout properly cleaning up session data

## Notes

- Backend uses SQLite in-memory database, so data is lost on server restart
- JWT tokens expire after 24 hours (configurable in backend)
- All error messages are in Russian
- The application supports dark mode via system preference or manual toggle

## Troubleshooting

### CORS Errors
- Verify backend is running on port 3000
- Check `VITE_API_URL` env variable in frontend

### Token Not Persisting
- Check localStorage is enabled in browser
- Verify API endpoint returns token in response

### Redirect Not Working
- Check browser console for JavaScript errors
- Verify NavigationContext is properly set up
- Check PrivateRoute component is wrapping dashboard

### Database Errors
- Verify backend has created the users table
- Check backend console for SQL errors
