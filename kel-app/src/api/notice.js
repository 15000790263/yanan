import service from '../utils/service';
import config from '../config';

// 获取公告列表（系统公告）
export const getNoticeList = params => service.get(`${config.url}/system/notice/list`, { params });

// 获取通知列表（业务通知）
export const getBusinessNoticeList = params => service.get(`${config.url}/business/notice/list`, { params });
