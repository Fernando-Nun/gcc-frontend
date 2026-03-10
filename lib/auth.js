export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('gcc_token');
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('gcc_user') || 'null');
  } catch {
    return null;
  }
}

export function setSession(token, user) {
  localStorage.setItem('gcc_token', token);
  localStorage.setItem('gcc_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('gcc_token');
  localStorage.removeItem('gcc_user');
}

export function isAuthenticated() {
  return !!getToken();
}