import service from '../utils/service';
import config from '../config';

export const getUserPermissionsInfo = id => service.get(`${config.url}/system/user/${id}`);

export const getParamsById = id => service.get(`${config.url}/system/config/${id}`);

// 张盛文件上传
export const commonUpload = blob => {
  const formData = new FormData();
  formData.append('file', blob);
  return service.post(`${config.url}/file/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

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
export const getFileInfo = (id) => {
  return service.get(`${config.url}/system/file/${id}`);
};

export const updateUser = data => {
  return service.put(`${config.url}/system/user`, data);
};

// 修改密码
export const resetPwd = data => service.put(`${config.url}/system/user/resetPwd`, data);

// 修改用户信息
export const updateUserInfo = async data => {
  const res = await getUserPermissionsInfo(data.id);
  return service.put(`${config.url}/system/user`, {
    ...{
      ...res.data.data,
      postIds: res.data.postIds,
      posts: res.data.posts,
      roleIds: res.data.roleIds,
      roles: res.data.roles,
    },
    ...data,
  });
};

// 获取调压箱信息
export const getPressureBoxInfo = params =>
  service.get(`${config.url}/safe/yb/Device/getBoxGisList`, { params });

// 获取阀井信息
export const getValveInfo = () => service.get(`${config.url}/safe/yb/Device/getValvewellGisList`);

// 根据字典类型查询字典数据信息
export function getDicts(dictType) {
  return service.get(`${config.url}/system/dict/data/type/${dictType}`);
}
