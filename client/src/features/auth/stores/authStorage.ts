function getAccessToken() {
  return localStorage.getItem('accessToken');
}

function setAccessToken(accessToken: string) {
  localStorage.setItem('accessToken', accessToken);
}

function setExpiresAt(expiresAt: string) {
  localStorage.setItem('expiresAt', expiresAt);
}

function removeAccessToken() {
  localStorage.removeItem('accessToken');
}

const AuthStorage = {
  getAccessToken,
  setAccessToken,
  setExpiresAt,
  removeAccessToken,
};

export default AuthStorage;
