import service from '../utils/service';
import config from '../config';

const baseUrl = `${config.url}`;

export const getDutyDataList = dutydate =>
  service.post(`${baseUrl}/product/dutylook/dutylookdetail`, {
    dutydate,
  });
