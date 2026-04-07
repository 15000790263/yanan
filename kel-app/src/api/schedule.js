import service from '../utils/service';
import config from '../config';

/**
 * 获取进度计划列表
 * @param {Object} query - 查询参数
 * @returns {Promise}
 */
export const getScheduleList = (query) => {
  return service.get(`${config.url}/business/schedule/list`, {
    params: {
      pageNum: 1,
      pageSize: 10,
      ...query
    }
  });
};

/**
 * 获取进度计划详情
 * @param {number} id - 进度计划ID
 * @returns {Promise}
 */
export const getScheduleDetail = (id) => {
  return service.get(`${config.url}/business/schedule/${id}`);
};
