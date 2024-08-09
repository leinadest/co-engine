function getAccessToken() {
  return localStorage.getItem('accessToken');
}

function setAccessToken(accessToken: string) {
  localStorage.setItem('accessToken', accessToken);
}

function removeAccessToken() {
  localStorage.removeItem('accessToken');
}

const AuthStorage = { getAccessToken, setAccessToken, removeAccessToken };
export default AuthStorage;
