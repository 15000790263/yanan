import service from '../utils/service';
import config from '../config';

// 获取验证码
export const getVerificationCode = () => service.get(`${config.url}/code`);

// 登录
export const login = data => service.post(`${config.url}/login`, data);
//
// export const getInfo = () => service.get(`${config.url}/system/user/getInfo`);
export const getInfo = () => service.get(`${config.url}/getInfo`);
// 登出
export const logout = () => service.post(`${config.url}/logout`);

// 短信发送
export const getPhoneCode = number => service.get(`${config.url}/auth/sendSmsCode/${number}`);

// 短信登录
export const loginForSms = data => service.post(`${config.url}/auth/smsLogin`, data);
// 获取菜单
export const getMenu = () => service.get(`${config.url}/getRouters`);
