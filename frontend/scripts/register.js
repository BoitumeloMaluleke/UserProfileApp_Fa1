/**
 * Registration Page Script
 * Handles user registration with real-time validation.
 */

// API base URL - automatically uses current domain (works for localhost and Azure)
const API_BASE = window.location.origin + '/api';

// Validation regex patterns for email and phone format checking
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Standard email format
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,15}$/; // Phone with optional country code and formatting

// Get references to DOM elements for form inputs and message displays
const form = document.getElementById('register-form');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const phoneInput = document.getElementById('phone');
const dobInput = document.getElementById('dob');

const usernameMessage = document.getElementById('username-message');
const emailMessage = document.getElementById('email-message');
const passwordMessage = document.getElementById('password-message');
const phoneMessage = document.getElementById('phone-message');
const dobMessage = document.getElementById('dob-message');

/**
 * Display field message with styling
 * Updates message element with text and applies success (green) or error (red) styling.
 */
const setFieldMessage = (el, message, type) => {
  if (!el) return;
  el.textContent = message;
  el.classList.remove('hidden', 'text-red-600', 'text-green-600');
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
 * Validate email field
 * Checks if email has a value and matches email format, displays validation feedback.
 */
const validateEmail = () => {
  const value = emailInput?.value?.trim() || '';
  if (!value) {
    setFieldMessage(emailMessage, 'Email is required.', 'error');
    return false;
  }
  // Test email against regex pattern to ensure valid format
  if (!EMAIL_REGEX.test(value)) {
    setFieldMessage(emailMessage, 'Please enter a valid email address.', 'error');
    return false;
  }
  setFieldMessage(emailMessage, 'Email looks good.', 'success');
  return true;
};

/**
 * Validate password field
 * Checks if password has a value and meets minimum length requirement (6 characters).
 */
const validatePassword = () => {
  const value = passwordInput?.value || '';
  if (!value) {
    setFieldMessage(passwordMessage, 'Password is required.', 'error');
    return false;
  }
  // Check minimum password length (matches backend requirement)
  if (value.length < 6) {
    setFieldMessage(passwordMessage, 'Password must be at least 6 characters.', 'error');
    return false;
  }
  setFieldMessage(passwordMessage, 'Password looks good.', 'success');
  return true;
};

/**
 * Validate phone field (optional)
 * Phone is optional - if provided, must match phone regex pattern.
 */
const validatePhone = () => {
  const value = phoneInput?.value?.trim() || '';
  // Phone is optional - empty value is valid
  if (!value) {
    clearFieldMessage(phoneMessage);
    return true;
  }
  // If provided, must match phone regex pattern
  if (!PHONE_REGEX.test(value)) {
    setFieldMessage(
      phoneMessage,
      'Phone must contain only numbers, spaces, parentheses, or dashes.',
      'error'
    );
    return false;
  }
  setFieldMessage(phoneMessage, 'Phone number looks good.', 'success');
  return true;
};

/**
 * Validate date of birth field (optional)
 * Date of birth is optional - if provided, must be a valid date.
 */
const validateDob = () => {
  const value = dobInput?.value;
  // Date of birth is optional - empty value is valid
  if (!value) {
    clearFieldMessage(dobMessage);
    return true;
  }
  // Check if the date value is valid
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    setFieldMessage(dobMessage, 'Please choose a valid date.', 'error');
    return false;
  }
  setFieldMessage(dobMessage, 'Date looks good.', 'success');
  return true;
};

/**
 * Apply server-side validation errors to form fields
 * Maps server-side validation errors to the appropriate form fields (handles duplicates, etc.).
 */
const applyServerErrors = (errors = []) => {
  if (!errors || !errors.length) {
    return false;
  }
  
  // Iterate through errors and display them on corresponding form fields
  let handled = false;
  errors.forEach(({ param, msg }) => {
    if (param === 'username') {
      setFieldMessage(usernameMessage, msg, 'error');
      handled = true;
    }
    if (param === 'email') {
      setFieldMessage(emailMessage, msg, 'error');
      handled = true;
    }
    if (param === 'password') {
      setFieldMessage(passwordMessage, msg, 'error');
      handled = true;
    }
    if (param === 'phone') {
      setFieldMessage(phoneMessage, msg, 'error');
      handled = true;
    }
    if (param === 'dob') {
      setFieldMessage(dobMessage, msg, 'error');
      handled = true;
    }
  });
  
  return handled;
};

// Real-time validation - validate fields as user types
usernameInput?.addEventListener('input', validateUsername);
emailInput?.addEventListener('input', validateEmail);
passwordInput?.addEventListener('input', validatePassword);
phoneInput?.addEventListener('input', validatePhone);
dobInput?.addEventListener('input', validateDob);

/**
 * Form submit handler
 * Validates all fields, sends registration request to API, handles errors, and redirects to login.
 */
form?.addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent default form submission (page reload)

  // Validate all fields before submitting
  const isUsernameValid = validateUsername();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  const isPhoneValid = validatePhone();
  const isDobValid = validateDob();

  // Stop submission if any validation fails
  if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isPhoneValid || !isDobValid) {
    return;
  }

  try {
    // Build request payload with required fields
    const payload = {
      username: usernameInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value, // Don't trim password
    };
    
    // Only include optional fields if they have values (prevents sending empty strings)
    const phoneValue = phoneInput.value.trim();
    if (phoneValue) {
      payload.phone = phoneValue;
    }
    
    // Convert date to ISO string format for API
    if (dobInput.value) {
      payload.dob = new Date(dobInput.value).toISOString();
    }

    // Send registration request to API endpoint
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Check if response is JSON (handles server errors that return HTML)
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      console.error('Non-JSON response:', text);
      setFieldMessage(passwordMessage, 'Server error: Invalid response format', 'error');
      return;
    }

    // Parse JSON response from server
    const data = await res.json();
    // Check if request was successful
    if (!res.ok) {
      // Try to apply server-side validation errors to form fields
      const handled = applyServerErrors(data.errors);
      // If no field-specific errors, show general error message
      if (!handled) {
        setFieldMessage(passwordMessage, data.message || 'Registration failed.', 'error');
      }
      return;
    }

    // Registration successful - show success messages
    setFieldMessage(usernameMessage, 'Registration successful. Redirecting to login...', 'success');
    setFieldMessage(emailMessage, 'Registration successful.', 'success');
    setFieldMessage(passwordMessage, 'Password stored securely.', 'success');
    clearFieldMessage(phoneMessage);
    clearFieldMessage(dobMessage);

    // Redirect to login page after a short delay (gives users time to see success message)
    setTimeout(() => {
      window.location.href = './login.html';
    }, 1200);
  } catch (err) {
    // Handle network errors or other exceptions
    console.error('Registration error:', err);
    setFieldMessage(passwordMessage, err.message || 'Registration failed.', 'error');
  }
});


