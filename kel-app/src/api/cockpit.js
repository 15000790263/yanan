import service from '../utils/service';
import config from '../config';

const common = (url, name, sqlId, data = {}, isSearch = true) =>
  new Promise((resolve, reject) =>
    service
      .post(`${config.url}${url}dataService/${isSearch ? 'selectRequest' : 'executeRequest'}`, {
        data: [
          {
            paraMaps: {
              ContextName: name,
              ...data,
            },
            sqlId: sqlId,
          },
        ],
        transaction: false,
      })
      .then(
        res => {
          if (res.data.responseModelList && res.data.responseModelList.length > 0) {
            resolve({
              data: res.data.responseModelList[0].dataTable.stringRowsMaps,
              res,
            });
          } else {
            resolve({
              data: res.data,
              res,
            });
          }
        },
        error => {
          reject(error);
        }
      )
  );

// 管线巡检
export const getPipeline = data =>
  service.get(`${config.url}/safe/pipelinepatrol/patrolCurrent`, {
    params: data,
  });

// 调压箱巡检
export const getPressureRegulatingBox = data =>
  service.get(`${config.url}/safe/regulatorplan/regulatorStatistics`, {
    params: data,
  });

// 阀井巡检
export const getValvePit = data =>
  service.get(`${config.url}/safe/valveplan/valveStatistics`, {
    params: data,
  });

// 隐患信息分组统计
// startDate   如: 2023-08-10
// endDate     如: 2023-08-10
export const hazardInformation = data => {
  return common('/productschedule/', 'slave21', 'b2a4674e92384855b3a64df94a71a67a', data, true);
};

// 维保统计
// total:设备总数   wh:已维护设备数   by:已保养设备数
export const maintenanceStatistics = data =>
  service.get(`${config.url}/equipment/common/sbwbtj`, {
    params: data,
  });

// 获取安全天数基准日
export const getSafetyDays = () =>
  service.get(`${config.url}/system/config/list?pageNum=1&pageSize=10&configKey=base_safe_day`);
