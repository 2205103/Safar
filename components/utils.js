export const fetchWithAuth = async (url, options = {}, navigate, logOut) => {
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
    if (typeof logOut === 'function') {
      logOut();
    }
    if (typeof navigate === 'function') {
      navigate('/users/login');
    }
    throw new Error('Unauthorized');
  }

  return response;
};
