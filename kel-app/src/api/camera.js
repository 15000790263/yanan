import service from '../utils/service';
import config from '../config';

// 获取摄像头列表
export const getCameraList = () =>
  service.post(`${config.url}/emergency/emergency/camera/selectList
`);
