export const authenticated = () => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('accessToken');
  return !!token;
};

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}; 