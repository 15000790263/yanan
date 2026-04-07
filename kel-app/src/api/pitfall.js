import service from '../utils/service';
import config from '../config';

// 隐患列表查询接口
export const getPitfallList = data =>
  service.post(`${config.url}/productschedule/dataService/selectRequest`, {
    data: [
      {
        paraMaps: { ContextName: 'slave21', ...data },
        sqlId: '6128c3148b8011efa74c00155d1f6e00',
      },
    ],
    transaction: true,
  });

async function getToken() {
  return service.get(`${config.url}/equipment/dangerRemote/rest/token`);
}

// 隐患新增
export const addPitfallApi = async data => {
  const res = await getToken();
  const { token } = res.data;
  return service.post(`${config.url}/equipment/dangerRemote/rest/receiveFaultInfo`, {
    token,
    data: JSON.stringify(data),
  });
};

// 上传隐患图片
export const addPitfallPicApi = async data => {
  const res = await getToken();
  const { token } = res.data;
  return service.post(`${config.url}/equipment/dangerRemote/rest/receiveFaultPic`, {
    token,
    data: JSON.stringify(data),
  });
};

// 隐患处理
export const processPitfallPicApi = async data => {
  const res = await getToken();
  const { token } = res.data;
  return service.post(`${config.url}/equipment/dangerRemote/rest/receiveFaultProcessInfo`, {
    token,
    data: JSON.stringify(data),
  });
};

// 查询用户
export const getYhUser = () =>
  service.post(`${config.url}/productschedule/dataService/selectRequest`, {
    data: [
      {
        paraMaps: { ContextName: 'slave21' },
        sqlId: '5d63e182905611efa2576aa692d6860e',
      },
    ],
    transaction: true,
  });
