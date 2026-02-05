// API functions for auth (registration)

export const registerUser = async (name, email, password, passwordConfirm) => {
  const response = await fetch('/api/auth/v1/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password, password_confirm: passwordConfirm || password }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle validation errors
    if (data.email) {
      throw new Error(data.email[0] || 'Email error');
    }
    if (data.password) {
      throw new Error(data.password[0] || 'Password error');
    }
    if (data.name) {
      throw new Error(data.name[0] || 'Name error');
    }
    throw new Error(data.detail || 'Registration failed');
  }

  // Store tokens
  if (data.access_token) {
    localStorage.setItem('authToken', data.access_token);
    localStorage.setItem('refreshToken', data.refresh_token);
  }
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
};

export const loginUser = async (email, password) => {
  const response = await fetch('/api/auth/v1/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || data.message || 'Login failed');
  }

  // Store tokens
  if (data.access_token) {
    localStorage.setItem('authToken', data.access_token);
    localStorage.setItem('refreshToken', data.refresh_token);
  }
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
};

export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

// Decode JWT to get account_type
export const getAccountType = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.account_type || 'B2C';
  } catch {
    return null;
  }
};

// Check if user is B2B (recruiter)
export const isB2BUser = () => {
  const user = getUser();
  return user?.account_type === 'B2B';
};

// Check if user is B2C (practitioner)
export const isB2CUser = () => {
  const user = getUser();
  return user?.account_type === 'B2C' || user?.account_type === 'HYBRID';
};
