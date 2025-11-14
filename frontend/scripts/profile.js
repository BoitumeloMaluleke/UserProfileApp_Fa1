// API base URL - automatically uses current domain (works for localhost and Azure)
const API_BASE = window.location.origin + '/api';
// Get authentication token from browser's localStorage
const token = localStorage.getItem('token');

// Authentication check - redirect to login if no token found (protects profile page)
if (!token) {
  window.location.href = './login.html';
}

// Validation regex patterns for email and phone format checking
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Standard email format
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,15}$/; // Phone with optional country code and formatting

// Get references to DOM elements for display fields and form inputs
const displayUsername = document.getElementById('display-username');
const displayEmail = document.getElementById('display-email');
const displayPhone = document.getElementById('display-phone');
const displayDob = document.getElementById('display-dob');
const avatarFallback = document.getElementById('avatar-fallback');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const dobInput = document.getElementById('dob');
const emailMessage = document.getElementById('email-message');
const phoneMessage = document.getElementById('phone-message');
const dobMessage = document.getElementById('dob-message');
const profileForm = document.getElementById('profile-form');

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
 * Format ISO date string for display
 * Converts ISO date string to localized date string, returns em dash if invalid/empty.
 */
const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString();
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
  if (!EMAIL_REGEX.test(value)) {
    setFieldMessage(emailMessage, 'Please enter a valid email address.', 'error');
    return false;
  }
  setFieldMessage(emailMessage, 'Email looks good.', 'success');
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
    setFieldMessage(phoneMessage, 'Phone number is optional.', 'success');
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
 * Maps server-side validation errors to the appropriate form fields.
 */
const applyServerErrors = (errors = []) => {
  if (!errors || !errors.length) {
    return false;
  }
  // Iterate through errors and display them on corresponding form fields
  let handled = false;
  errors.forEach(({ param, msg }) => {
    if (param === 'email') {
      setFieldMessage(emailMessage, msg, 'error');
      handled = true;
    } else if (param === 'phone') {
      setFieldMessage(phoneMessage, msg, 'error');
      handled = true;
    } else if (param === 'dob') {
      setFieldMessage(dobMessage, msg, 'error');
      handled = true;
    }
  });
  return handled;
};

const loadProfile = async () => {
  try {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // Check if response is JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      console.error('Non-JSON response:', text);
      throw new Error('Server error: Invalid response format');
    }
    
    const data = await res.json();
    if (!res.ok) {
      const handled = applyServerErrors(data.errors);
      const error = new Error(data.message || 'Failed to load profile');
      error.handled = handled;
      throw error;
    }

    const username = data.username || localStorage.getItem('username') || 'User';
    if (displayUsername) displayUsername.textContent = username;
    if (avatarFallback) avatarFallback.textContent = (username[0] || 'U').toUpperCase();
    if (displayEmail) displayEmail.textContent = data.email || '—';
    if (displayPhone) displayPhone.textContent = data.phone || '—';
    if (displayDob) displayDob.textContent = fmtDate(data.dob);

    if (emailInput) {
      emailInput.value = data.email || '';
      validateEmail();
    }
    if (phoneInput) {
      phoneInput.value = data.phone || '';
      validatePhone();
    }
    if (dobInput) {
      if (data.dob) {
        const d = new Date(data.dob);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        dobInput.value = `${yyyy}-${mm}-${dd}`;
      } else {
        dobInput.value = '';
      }
      validateDob();
    }
  } catch (err) {
    if (!err.handled) {
      setFieldMessage(emailMessage, err.message, 'error');
      setFieldMessage(phoneMessage, err.message, 'error');
    }
  }
};

emailInput?.addEventListener('input', validateEmail);
phoneInput?.addEventListener('input', validatePhone);
dobInput?.addEventListener('input', validateDob);

profileForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const isEmailValid = validateEmail();
  const isPhoneValid = validatePhone();
  const isDobValid = validateDob();

  if (!isEmailValid || !isPhoneValid || !isDobValid) {
    return;
  }

  try {
    const payload = {
      email: emailInput?.value?.trim() || '',
      phone: phoneInput?.value?.trim() || '',
      dob: dobInput?.value ? new Date(dobInput.value).toISOString() : null,
    };
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    
    // Check if response is JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      console.error('Non-JSON response:', text);
      throw new Error('Server error: Invalid response format');
    }
    
    const data = await res.json();

    let handled = false;
    if (!res.ok) {
      handled = applyServerErrors(data.errors);
      const error = new Error(data.message || 'Failed to update profile');
      error.handled = handled;
      throw error;
    }

    if (displayEmail) displayEmail.textContent = data.email || '—';
    if (displayPhone) displayPhone.textContent = data.phone || '—';
    if (displayDob) displayDob.textContent = fmtDate(data.dob);

    setFieldMessage(emailMessage, 'Profile updated successfully.', 'success');
    setFieldMessage(phoneMessage, 'Profile updated successfully.', 'success');
    validateDob();
  } catch (err) {
    if (!err.handled) {
      setFieldMessage(emailMessage, err.message, 'error');
      setFieldMessage(phoneMessage, err.message, 'error');
    }
  }
});

document.getElementById('logout')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = './login.html';
});

loadProfile();
