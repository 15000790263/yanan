import service from '../utils/service';
import config from '../config';

const baseUrl = `${config.url}/emergency`;

//	查询应急事件列表
export const getEventList = () =>
  service.get(`${baseUrl}/emergency/event/list?pageSize=9999&pageNum=1`);

//	3.	查询事件详情
export const getEventDetail = id => service.get(`${baseUrl}/emergency/event/${id}`);

//	4.	上传文件（图片、视频）
export const uploadFile = (blob, name) => {
  const formData = new FormData();
  formData.append('file', blob, name);
  return service.post(`${baseUrl}/file/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 5.	查询事件进展
export const getEventProcess = id =>
  service.get(`${baseUrl}/emergency/message/list`, {
    params: {
      id,
    },
  });

//6.	查询最新事件消息
export const getEventNew = (eventId, eventTime) =>
  service.get(`${baseUrl}/emergency/message/latest`, {
    params: {
      eventId,
      eventTime,
    },
  });

// 查询事件消息列表
export const getEventInfoList = data => {
  const { eventId, pageNum = 1, pageSize = 9999 } = data;
  return service.get(`${baseUrl}/emergency/message/list`, {
    params: {
      eventId,
      pageNum,
      pageSize,
    },
  });
};

// 查看图片
export const getScreenshotList = messageId =>
  service.get(`${baseUrl}/emergency/screenshot/list?messageId=${messageId}`);

// 发送文字消息
export const sendMark = data => service.post(`${baseUrl}/emergency/mark/save`, data);

// 发送图文消息
export const sendImageMark = data =>
  service.post(`${baseUrl}/emergency/screenshot`, {
    ...data,
    title: '',
  });

// 获取图文消息(修改eventTime)
export const getMessage = params =>
  service.get(`${baseUrl}/emergency/screenshot/list`, {
    params,
  });

// 发送图文消息(修改eventTime, 修改消息)
export const modifyEventTime = data => service.put(`${baseUrl}/emergency/message`, data);

// 查询应急用户
export const getUserList = () =>
  service.get(`${baseUrl}/emergency/user/list?pageSize=10000&orgId=GS.JinZ`);

// 查询应急职务字典
export const getEmergencyPost = () =>
  service.get(`${baseUrl}/system/dict/data/list?pageNum=1&pageSize=10&dictType=emergency_post`);

// 查询用户信息
export const getUserInfo = () => service.get(`${config.url}/system/user/profile`);

// 查询文件信息
export const getFileById = id => service.get(`${baseUrl}/file/getInfoBatch/${id}`);

// 修改文本信息的图片
export const modifyScreenshot = data => service.put(`${baseUrl}/emergency/screenshot`, data);
