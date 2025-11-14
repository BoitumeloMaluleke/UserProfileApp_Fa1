/**
 * Login Page Script
 * Handles user authentication with real-time validation.
 */

// API base URL - automatically uses current domain (works for localhost and Azure)
const API_BASE = window.location.origin + '/api';

// Get references to DOM elements for form, inputs, and message displays
const form = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const usernameMessage = document.getElementById('username-message');
const passwordMessage = document.getElementById('password-message');

/**
 * Display field message with styling
 * Updates message element with text and applies success (green) or error (red) styling.
 */
const setFieldMessage = (el, message, type) => {
  if (!el) return;
  el.textContent = message;
  // Remove all possible styling classes first
  el.classList.remove('hidden', 'text-red-600', 'text-green-600');
  // Add appropriate color class based on message type
  el.classList.add(type === 'success' ? 'text-green-600' : 'text-red-600');
};

/**
 * Clear field message
 * Hides the message element and removes all styling classes.
 */
const clearFieldMessage = (el) => {
  if (!el) return;
  el.textContent = '';
  el.classList.add('hidden');
  el.classList.remove('text-red-600', 'text-green-600');
};

/**
 * Validate username field
 * Checks if username has a value and displays validation feedback to user.
 */
const validateUsername = () => {
  const value = usernameInput?.value?.trim() || '';
  if (!value) {
    setFieldMessage(usernameMessage, 'Username is required.', 'error');
    return false;
  }
  setFieldMessage(usernameMessage, 'Username looks good.', 'success');
  return true;
};

/**
 * Validate password field
 * Checks if password has a value and displays validation feedback to user.
 */
const validatePassword = () => {
  const value = passwordInput?.value || '';
  if (!value) {
    setFieldMessage(passwordMessage, 'Password is required.', 'error');
    return false;
  }
  setFieldMessage(passwordMessage, 'Password looks good.', 'success');
  return true;
};

// Real-time validation - validate fields as user types
usernameInput?.addEventListener('input', validateUsername);
passwordInput?.addEventListener('input', validatePassword);

/**
 * Form submit handler
 * Validates form, sends login request to API, stores JWT token, and redirects to profile.
 */
form?.addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent default form submission (page reload)

  // Validate all fields before submitting
  const isUsernameValid = validateUsername();
  const isPasswordValid = validatePassword();

  // Stop submission if validation fails
  if (!isUsernameValid || !isPasswordValid) {
    return;
  }

  // Get form values (trim username, don't trim password)
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  try {
    // Send login request to API endpoint
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    // Check if response is JSON (handles server errors that return HTML)
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      console.error('Non-JSON response:', text);
      throw new Error('Server error: Invalid response format');
    }
    
    // Parse JSON response from server
    const data = await res.json();
    // Check if request was successful (status 200-299)
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Login successful - show success messages
    setFieldMessage(usernameMessage, 'Login successful.', 'success');
    setFieldMessage(passwordMessage, 'Login successful.', 'success');

    // Store JWT token in browser's localStorage for authenticated requests
    localStorage.setItem('token', data.token);
    // Store username for display purposes
    localStorage.setItem('username', data.username || username || '');
    // Redirect to profile page after successful login
    window.location.href = './profile.html';
  } catch (err) {
    // Display error messages to user if login fails
    setFieldMessage(passwordMessage, err.message, 'error');
    setFieldMessage(usernameMessage, err.message, 'error');
  }
});
