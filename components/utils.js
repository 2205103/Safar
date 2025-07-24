export const fetchWithAuth = async (url, options, navigate) => {
  const token = localStorage.getItem('token');

  const newOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  const response = await fetch(url, newOptions);

  if (response.status === 401) {
    localStorage.removeItem('token');
    // Assuming '/users/login' is your login route based on previous context
    navigate('/users/login'); 
    throw new Error('Unauthorized');
  }

  return response;
};