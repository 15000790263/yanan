import service from '../utils/service';
import config from '../config';

/**
 * 获取施工日志列表
 * @param {Object} query - 查询参数
 * @returns {Promise}
 */
export const getLogList = query => {
  return service.get(`${config.url}/business/constructionLog/list`, {
    params: {
      pageNum: 1,
      pageSize: 10,
      ...query,
    },
  });
};

/**
 * 获取施工日志详情（含今日内容和明日计划）
 * @param {number} id - 日志ID
 * @returns {Promise}
 */
export const getLogDetail = id => {
  return service.get(`${config.url}/business/constructionLog/detail/${id}`);
};

/**
 * 获取施工日志统计：各状态数量及总数量
 * @returns {Promise}
 */
export const getLogStats = () => {
  return service.get(`${config.url}/business/constructionLog/stats`);
};

/**
 * 保存施工日志
 * @param {Object} data - 施工日志数据
 * @returns {Promise}
 */
export const saveConstructionLog = data => {
  return service.post(`${config.url}/business/constructionLog`, data);
};

/**
 * 批量保存今日施工内容
 * @param {Array} data - 今日施工内容数组
 * @returns {Promise}
 */
export const saveConstructionToday = data => {
  return service.post(`${config.url}/business/constructionToday/batch`, data);
};

/**
 * 批量保存明日施工计划
 * @param {Array} data - 明日施工计划数组
 * @returns {Promise}
 */
export const saveConstructionTomorrow = data => {
  return service.post(`${config.url}/business/constructionTomorrow/batch`, data);
};

/**
 * 更新施工日志
 * @param {Object} data - 施工日志数据
 * @returns {Promise}
 */
export const updateConstructionLog = data => {
  return service.put(`${config.url}/business/constructionLog`, data);
};

/**
 * 删除今日施工内容
 * @param {string} ids - 逗号分隔的ID列表
 * @returns {Promise}
 */
export const deleteConstructionToday = ids => {
  return service.delete(`${config.url}/business/constructionToday/${ids}`);
};

/**
 * 删除明日施工计划
 * @param {string} ids - 逗号分隔的ID列表
 * @returns {Promise}
 */
export const deleteConstructionTomorrow = ids => {
  return service.delete(`${config.url}/business/constructionTomorrow/${ids}`);
};

/**
 * 获取工序树
 * @param {string} projectCode - 项目编码
 * @param {string} deptId - 部门ID
 * @param {string} currentDate - 当前日期
 * @returns {Promise}
 */
export const getProcessTree = (deptId, currentDate) => {
  return service.get(`${config.url}/business/schedule/processTree`, {
    params: { deptId, currentDate },
  });
};
