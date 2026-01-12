const API_BASE_URL = 'http://127.0.0.1:8000';

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    // Check if response is OK
    if (!response.ok) {
      const errorMessage = data.message || data.error || `HTTP Error: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    // Store token if provided
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }

    return data;
  } catch (error) {
    // Re-throw with a user-friendly message
    if (error instanceof TypeError && error.message.includes('JSON')) {
      throw new Error('Invalid response from server.');
    }
    if (error instanceof TypeError) {
      throw new Error('Unable to connect to the server. Please check your connection.');
    }
    throw error;
  }
};