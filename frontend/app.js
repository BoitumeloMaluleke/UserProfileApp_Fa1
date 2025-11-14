const API_BASE_URL = 'http://localhost:5000/api';

const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const profileSection = document.getElementById('profile-section');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profileBio = document.getElementById('profile-bio');
const profileAvatar = document.getElementById('profile-avatar');
const saveProfileBtn = document.getElementById('save-profile');
const logoutBtn = document.getElementById('logout');

let authToken = localStorage.getItem('token') || '';

const setActiveTab = (formToShow) => {
  if (formToShow === 'register') {
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    showRegisterBtn.classList.add('active');
    showLoginBtn.classList.remove('active');
  } else {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    showLoginBtn.classList.add('active');
    showRegisterBtn.classList.remove('active');
  }
};

showRegisterBtn?.addEventListener('click', () => setActiveTab('register'));
showLoginBtn?.addEventListener('click', () => setActiveTab('login'));

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

const setToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

const showProfileSection = () => {
  profileSection.classList.remove('hidden');
};

const hideProfileSection = () => {
  profileSection.classList.add('hidden');
};

registerForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await handleResponse(response);
    setToken(data.token);
    await fetchProfile();
    showProfileSection();
  } catch (error) {
    alert(error.message);
  }
});

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await handleResponse(response);
    setToken(data.token);
    await fetchProfile();
    showProfileSection();
  } catch (error) {
    alert(error.message);
  }
});

const fetchProfile = async () => {
  if (!authToken) {
    hideProfileSection();
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = await handleResponse(response);
    profileName.textContent = data.name;
    profileEmail.textContent = data.email;
    profileBio.value = data.bio || '';
    profileAvatar.value = data.avatarUrl || '';
    showProfileSection();
  } catch (error) {
    alert(error.message);
  }
};

saveProfileBtn?.addEventListener('click', async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name: profileName.textContent,
        bio: profileBio.value,
        avatarUrl: profileAvatar.value,
      }),
    });

    const data = await handleResponse(response);
    profileName.textContent = data.name;
    alert('Profile updated');
  } catch (error) {
    alert(error.message);
  }
});

logoutBtn?.addEventListener('click', () => {
  setToken('');
  hideProfileSection();
});

if (authToken) {
  fetchProfile();
}


