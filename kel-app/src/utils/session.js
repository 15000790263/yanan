export const setToken = token => {
  localStorage.setItem('Authorization', token);
};

export const getToken = () => {
  const token = localStorage.getItem('Authorization');
  return token ? token : '';
};

export const clearToken = () => {
  localStorage.removeItem('Authorization');
};

export const setUserName = name => {
  localStorage.setItem('username', name);
};

export const getUserName = () => {
  return localStorage.getItem('username');
};

export const setUserId = id => {
  localStorage.setItem('userid', id);
};

export const getUserId = () => {
  return localStorage.getItem('userid');
};

export const setName = name => {
  localStorage.setItem('name', name);
};

export const getName = () => {
  return localStorage.getItem('name');
};

export const clearSession = () => {
  return localStorage.clear();
};

export const setTokenFromRestcloud = token => {
  localStorage.setItem('identitytoken', token);
};

export const getTokenRestcloud = () => {
  const token = localStorage.getItem('identitytoken');
  return token ? token : '';
};

export const setUserRole = role => {
  localStorage.setItem('role', role);
};

export const getUserRole = () => {
  return localStorage.getItem('role');
};

export const clearUserRole = () => {
  localStorage.removeItem('role');
};

export const setLoginInfo = infoStr => {
  localStorage.setItem('loginInfo', infoStr);
};

export const getLoginInfo = () => {
  return localStorage.getItem('loginInfo');
};

export const clearLoginInfo = () => {
  localStorage.removeItem('loginInfo');
};

export const setUserInfo = info => {
  localStorage.setItem('userInfo', JSON.stringify(info));
};

export const getUserInfo = () => {
  return localStorage.getItem('userInfo');
};

export const setIsInspect = is => {
  return localStorage.setItem('isInspect', JSON.stringify(is));
};

export const getIsInspect = () => {
  return localStorage.getItem('isInspect');
};

export const clearIsInspect = () => {
  return localStorage.removeItem('isInspect');
};
