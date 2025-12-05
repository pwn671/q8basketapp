// utils/useIsLoggedIn.js
export function useIsLoggedIn() {
  const token = localStorage.getItem('token'); // adjust based on your login logic
  return !!token;
}
