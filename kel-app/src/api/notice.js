import service from '../utils/service';
import config from '../config';

// 获取公告列表（系统公告）
export const getNoticeList = params => service.get(`${config.url}/system/notice/list`, { params });

// 获取通知列表（业务通知）
export const getBusinessNoticeList = params => service.get(`${config.url}/business/notice/list`, { params });

// 新增通知
export const addNotice = data => service.post(`${config.url}/business/notice`, data);

// 批量上传文件
export const batchUpload = files => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  return service.post(`${config.url}/common/uploads`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 获取文件详情
export const getFileInfo = id => service.get(`${config.url}/system/file/${id}`);
