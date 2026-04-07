import service from '../utils/service';
import config from '../config';

// 获取报警详情
export const getAlarmData = type =>
  service.get(`${config.url}/emergency/inspect/etl_flow_240104003?type=${type}`);

// 获取报警数量
export const getAlarmCount = () =>
  service.get(`${config.url}/emergency/inspect/etl_flow_240104001`);
