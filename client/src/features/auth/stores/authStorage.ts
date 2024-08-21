function getAccessToken() {
  if (typeof window === 'undefined') return;
  return localStorage.getItem('accessToken');
}

function setAccessToken(accessToken: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', accessToken);
}

function setExpiresAt(expiresAt: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('expiresAt', expiresAt);
}

function removeAccessToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
}

const AuthStorage = {
  getAccessToken,
  setAccessToken,
  setExpiresAt,
  removeAccessToken,
};

export default AuthStorage;
