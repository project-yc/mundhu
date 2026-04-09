const DEFAULT_SIGNUP_ENDPOINT = '/api/auth/v1/signup';

const persistAuthSession = (data) => {
  const tokens = data.tokens || data;
  const accessToken = tokens.access_token || data.access_token;
  const refreshToken = tokens.refresh_token || data.refresh_token;
  const userRole = data.role || data.user?.role || null;

  if (!accessToken) {
    return;
  }

  localStorage.setItem('authToken', accessToken);

  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  } else {
    localStorage.removeItem('refreshToken');
  }

  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  if (data.org) {
    localStorage.setItem('org', JSON.stringify(data.org));
  }

  if (userRole) {
    localStorage.setItem('userRole', userRole);
  } else {
    localStorage.removeItem('userRole');
  }
};

const postSignup = async (endpoint, payload) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const errorMessage = data.detail || data.message || data.error || `HTTP Error: ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
};

export const signupUser = async ({ name, email, password, role }) => {
  const normalizedRole = role === 'RECRUITER' ? 'RECRUITER' : 'USER';
  const payload = { name, email, password, role: normalizedRole };

  const signupData = await postSignup(DEFAULT_SIGNUP_ENDPOINT, payload);
  persistAuthSession(signupData);
  return signupData;
};