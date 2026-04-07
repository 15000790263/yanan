import service from '../utils/service';
import config from '../config';

const baseUrl = `${config.url}`;

// export const getDutyDataList = dutydate =>
//   service.post(`${baseUrl}/product/dutylook/dutylookdetail`, {
//     dutydate,
//   });

export const getDataList = params =>
  service.get(`${baseUrl}/product/product/list`, {
    params,
  });

// 手动填报数据
export const add = data => service.post(`${baseUrl}/product/product`, data);

// 手动填报数据更新
export const update = data => service.put(`${baseUrl}/product/product`, data);

// 手动填报数据更新
export const getStatisticInfo = date => service.get(`${baseUrl}/product/product/static/${date}`);
//
