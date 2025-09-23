// Simple test to check authentication token
console.log('Checking authentication token...');

// Check localStorage
const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
console.log('Token from localStorage:', token ? 'Found' : 'Not found');

// Check cookies
const cookies = document.cookie.split(';');
const tokenCookie = cookies.find(cookie => 
  cookie.trim().startsWith('auth_token=') || cookie.trim().startsWith('token=')
);
console.log('Token from cookies:', tokenCookie ? 'Found' : 'Not found');

// Test API call
fetch('http://localhost:3001/api/auth/me', {
  headers: {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('Auth test response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Auth test response:', data);
})
.catch(error => {
  console.error('Auth test error:', error);
});