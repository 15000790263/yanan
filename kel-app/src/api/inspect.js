import dayjs from 'dayjs';
import service from '../utils/service';
import config from '../config';
import { getLoc } from '../views/inspect/util/location';
import { getDateRange, getMonthRange } from '../views/inspect/util/time';
import { isCharge } from '../utils/user-permission';
import { systemStore } from '../stores/system.js';
import useUserStore from '../stores/user';

const userStore = useUserStore();

// const baseUrl = "http://60.13.219.226:30001/safe"
const baseUrl = `${config.url}/safe`;
// const baseUrl = `http://192.168.31.111:9212/safe`;
// const baseUrl = `http://172.20.10.8:9212/safe`;

const sysStore = systemStore();

const fakeUser = {
  createBy: 'admin',
  createTime: '2023-04-18 10:15:45',
  updateBy: null,
  updateTime: null,
  remark: null,
  userId: 443,
  deptId: 249,
  userName: '13399966333',
  nickName: '严剑利',
  email: '',
  phonenumber: '13399966333',
  sex: '0',
  avatar: '',
  password: '$2a$10$Qjgq3df6WVNM.WVVWphWoOsNbZIVtUDvIO8Hjl9KJ1rmxNmQxCMF6',
  status: '0',
  delFlag: '0',
  loginIp: '',
  loginDate: null,
  dept: {
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    deptId: 249,
    parentId: 209,
    ancestors: '0,100,101,209',
    deptName: '输配区',
    orderNum: 4,
    leader: null,
    phone: null,
    email: null,
    status: '0',
    delFlag: null,
    parentName: null,
    iscompany: null,
    children: [],
    areaCode: null,
    deptCode: null,
  },
  roles: [
    {
      createBy: null,
      createTime: null,
      updateBy: null,
      updateTime: null,
      remark: null,
      roleId: 2,
      roleName: '普通角色',
      roleKey: 'common',
      roleSort: 2,
      dataScope: '2',
      menuCheckStrictly: false,
      deptCheckStrictly: false,
      status: '0',
      delFlag: null,
      flag: false,
      menuIds: null,
      deptIds: null,
      permissions: null,
      admin: false,
    },
    {
      createBy: null,
      createTime: null,
      updateBy: null,
      updateTime: null,
      remark: null,
      roleId: 106,
      roleName: '作业管理角色',
      roleKey: 'workcommon',
      roleSort: 0,
      dataScope: '1',
      menuCheckStrictly: false,
      deptCheckStrictly: false,
      status: '0',
      delFlag: null,
      flag: false,
      menuIds: null,
      deptIds: null,
      permissions: null,
      admin: false,
    },
  ],
  roleIds: null,
  postIds: null,
  address: null,
  speciality: null,
  roleId: null,
  nation: null,
  identitys: null,
  admin: false,
};

export const getUserInfoFromLocal = () => {
  let user;
  try {
    user = JSON.parse(localStorage.getItem('userInfo'));
  } catch (error) {
    console.warn('[Debug]::获取用户信息失败');
    user = fakeUser;
  }
  return user;
};

export const getUserName = () => {
  const dName = getUserInfoFromLocal()?.dept?.deptName;

  // 和pc端保持一致
  if (dName === '运行部') {
    return;
  }

  return getUserInfoFromLocal().nickName;
};

export const getUserName2 = () => {
  // const dName = getUserInfoFromLocal()?.dept?.deptName;

  // // 和pc端保持一致
  // if (dName === '运行部') {
  //   return;
  // }

  return getUserInfoFromLocal().nickName;
};

export const getUserId = () => {
  const dName = getUserInfoFromLocal()?.dept?.deptName;

  // 和pc端保持一致
  if (dName === '运行部') {
    return;
  }

  return getUserInfoFromLocal().userId;
};

export const getUserId2 = () => {
  // const dName = getUserInfoFromLocal()?.dept?.deptName;

  // // 和pc端保持一致
  // if (dName === '运行部') {
  //   return;
  // }

  return getUserInfoFromLocal().userId;
};

export const getDeptId = () => getUserInfoFromLocal().deptId;

export const getWorkAreaInfo = () => {
  const dName = getUserInfoFromLocal()?.dept?.deptName;

  return sysStore.workArea.find(item => item.dictLabel === dName)?.dictValue || 'Q';
};

export const getWorkAreaInfo2 = () => {
  const dName = getUserInfoFromLocal()?.dept?.deptName;

  // 和pc端保持一致
  if (dName === '运行部') {
    return;
  }

  return sysStore.workArea.find(item => item.dictLabel === dName)?.dictValue || 'Q';
};

export const getStaffs = () => {
  const url = `${config.url}emergency/emergency/user/list?pageSize=100`;
  return service.get(url);
};

const getPatrolPersonParam = () => {
  const permissions = userStore.permissions;
  const isLeader = permissions.includes('safe:plan:add');
  if (isLeader) {
    // 领导
    return {};
  }
  return {
    patrolPerson: getUserName(),
  };
};

// 调压箱
export const api_regulator = {
  // 定位打卡
  checkIn: (params = {}) => {
    return service.get(`${baseUrl}/regulatorplan/checkIn`, { params });
  },
  // 统计信息
  getStatistic: (p = {}) => {
    const { before, end } = getMonthRange();
    const defaultParams = {
      beginDate: before,
      endDate: end,
    };
    const params = {
      ...defaultParams,
      ...p,
      patrolPerson: getUserName(),
      patrolPersonId: getUserId(),
      area: getWorkAreaInfo2(),
    };

    if (isCharge()) {
      delete params.patrolPerson;
      delete params.patrolPersonId;
    }

    return service.get(`${baseUrl}/regulatorplan/planCurrentStatus`, { params });
  },

  getList: (p = {}) => {
    const params = {
      ...p,
      ...getPatrolPersonParam(),
      // 增加的区域信息
      workArea: getWorkAreaInfo2(),
    };
    return service.get(`${baseUrl}/regulatorplan/list`, { params });
  },

  getDetail: id => {
    return service.get(`${baseUrl}/regulatorplan/${id}`);
  },

  addPost: d => {
    return service.post(
      `${baseUrl}/regulatorplan?contentParam=${encodeURIComponent(JSON.stringify(d))}`
    );
  },

  deletePost: id => {
    return service.delete(`${baseUrl}/regulatorplan/${id}`);
  },

  putCheckForm: async (d = {}, files, pictureCache) => {
    let locationParams = {};
    const location = await getLoc();
    if (location) {
      locationParams = location;
    }
    const data = {
      ...d,
      ...locationParams,
      workArea: getWorkAreaInfo(),
      practicalPerson: getUserName(),
      practicalPersonId: getUserId(),
      practicalDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      // patrolDate: d.patrolDate += "-01"
    };

    // 一些可能没用但是有可能出现解析错误的属性
    delete data.regulatorLocation;
    delete data.roadName;
    delete data.groupName;
    delete data.longitude;
    delete data.latitude;

    if (data.isFollow) {
      delete data.practicalDate;
    }

    // 支持多文件上传
    let formData = undefined;

    if ((files && files.length > 0) || (pictureCache && pictureCache.length > 0)) {
      formData = new FormData();
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          // 文件名称
          let name = `${Date.parse(new Date())}${Math.floor(Math.random() * 1000)}`;

          // MIME类型映射
          const mimeToExtMap = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
            'image/svg+xml': '.svg',
            'image/webp': '.webp',
            'image/bmp': '.bmp',
            'audio/mpeg': '.mp3',
            'audio/wav': '.wav',
            'audio/ogg': '.ogg',
            'audio/mp4': '.m4a',
            'audio/aac': '.aac',
          };

          // formData.append(`files`, files[i]); // 注意这里的key可以自定义，但后端需要匹配
          formData.append(`files`, files[i], `${name}${mimeToExtMap[files[i].type]}`); // 注意这里的key可以自定义，但后端需要匹配
        }
      }

      // 添加三张照片
      if (pictureCache && pictureCache.length > 0) {
        for (let i = 0; i < pictureCache.length; i++) {
          // 文件名称
          let name = `${Date.parse(new Date())}${Math.floor(Math.random() * 1000)}`;

          // MIME类型映射
          const mimeToExtMap = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
            'image/svg+xml': '.svg',
            'image/webp': '.webp',
            'image/bmp': '.bmp',
            'audio/mpeg': '.mp3',
            'audio/wav': '.wav',
            'audio/ogg': '.ogg',
            'audio/mp4': '.m4a',
            'audio/aac': '.aac',
          };

          // formData.append(`files`, files[i]); // 注意这里的key可以自定义，但后端需要匹配
          formData.append(
            `files`,
            pictureCache[i].fileList[0].file,
            `${name}-${pictureCache[i].name}-${mimeToExtMap[pictureCache[i].fileList[0].file.type]}`
          ); // 注意这里的key可以自定义，但后端需要匹配
        }
      }
    }

    return service.put(
      `${baseUrl}/regulatorplan?contentParam=${encodeURIComponent(JSON.stringify(data))}`,
      formData
    );
  },

  transTaskAnother: (id, patrolPerson, patrolPersonId) => {
    const data = {
      delegateStatus: '1',
      patrolPerson,
      patrolPersonId,
      delegateDescription: `${getUserName()},${patrolPerson}`,
      id,
    };

    return service.put(
      `${baseUrl}/regulatorplan?contentParam=${encodeURIComponent(JSON.stringify(data))}`
    );
  },

  getStatisticInfo: params => {
    return service.get(`${baseUrl}/regulatorplan/regulatorStatistics`, {
      params,
    });
  },

  deletePlanById: id => {
    return service.delete(`${baseUrl}/regulatorplan/${id}`);
  },
};

// 阀井
export const api_well = {
  checkIn: (params = {}) => {
    return service.get(`${baseUrl}/valveplan/checkIn`, { params });
  },
  getStatistic: (p = {}) => {
    const { before, end } = getMonthRange();
    const defaultParams = {
      beginDate: before,
      endDate: end,
    };
    const params = {
      ...defaultParams,
      ...p,
      patrolPerson: getUserName(),
      patrolPersonId: getUserId(),
      area: getWorkAreaInfo2(),
    };

    if (isCharge()) {
      delete params.patrolPerson;
      delete params.patrolPersonId;
    }

    return service.get(`${baseUrl}/valveplan/planCurrentStatus`, { params });
  },
  getList: (p = {}) => {
    const params = {
      ...p,
      ...getPatrolPersonParam(),
      // 增加的区域信息
      workArea: getWorkAreaInfo2(),
    };
    return service.get(`${baseUrl}/valveplan/special/list`, { params });
  },

  getDetail: id => {
    return service.get(`${baseUrl}/valveplan/${id}`);
  },

  addPost: d => {
    return service.post(
      `${baseUrl}/valveplan?contentParam=${encodeURIComponent(JSON.stringify(d))}`
    );
  },

  deletePost: id => {
    return service.delete(`${baseUrl}/valveplan/${id}`);
  },

  putCheckForm: async (d = {}, files, pictureCache) => {
    let locationParams = {};
    const location = await getLoc();
    if (location) {
      locationParams = location;
    }
    const data = {
      ...d,
      ...locationParams,
      practicalPerson: getUserName(),
      practicalPersonId: getUserId(),
      workArea: getWorkAreaInfo(),
      practicalDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      // patrolDate: d.patrolDate += "-01"
    };

    // 一些可能没用但是有可能出现解析错误的属性
    delete data.valveLocation;
    delete data.roadName;
    delete data.groupName;
    delete data.longitude;
    delete data.latitude;

    if (data.isFollow) {
      delete data.practicalDate;
    }

    // 支持多文件上传
    let formData = undefined;

    if ((files && files.length > 0) || (pictureCache && pictureCache.length > 0)) {
      formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        // 文件名称
        let name = `${Date.parse(new Date())}${Math.floor(Math.random() * 1000)}`;

        // MIME类型映射
        const mimeToExtMap = {
          'image/jpeg': '.jpg',
          'image/png': '.png',
          'image/gif': '.gif',
          'image/svg+xml': '.svg',
          'image/webp': '.webp',
          'image/bmp': '.bmp',
          'audio/mpeg': '.mp3',
          'audio/wav': '.wav',
          'audio/ogg': '.ogg',
          'audio/mp4': '.m4a',
          'audio/aac': '.aac',
        };

        // formData.append(`files`, files[i]); // 注意这里的key可以自定义，但后端需要匹配
        formData.append(`files`, files[i], `${name}${mimeToExtMap[files[i].type]}`); // 注意这里的key可以自定义，但后端需要匹配
      }
    }

    // 添加三张照片
    if (pictureCache && pictureCache.length > 0) {
      for (let i = 0; i < pictureCache.length; i++) {
        // 文件名称
        let name = `${Date.parse(new Date())}${Math.floor(Math.random() * 1000)}`;

        // MIME类型映射
        const mimeToExtMap = {
          'image/jpeg': '.jpg',
          'image/png': '.png',
          'image/gif': '.gif',
          'image/svg+xml': '.svg',
          'image/webp': '.webp',
          'image/bmp': '.bmp',
          'audio/mpeg': '.mp3',
          'audio/wav': '.wav',
          'audio/ogg': '.ogg',
          'audio/mp4': '.m4a',
          'audio/aac': '.aac',
        };

        // formData.append(`files`, files[i]); // 注意这里的key可以自定义，但后端需要匹配
        formData.append(
          `files`,
          pictureCache[i].fileList[0].file,
          `${name}-${pictureCache[i].name}-${mimeToExtMap[pictureCache[i].fileList[0].file.type]}`
        ); // 注意这里的key可以自定义，但后端需要匹配
      }
    }

    return service.put(
      `${baseUrl}/valveplan?contentParam=${encodeURIComponent(JSON.stringify(data))}`,
      formData
    );
  },

  transTaskAnother: (id, patrolPerson, patrolPersonId) => {
    const data = {
      delegateStatus: '1',
      patrolPerson,
      patrolPersonId,
      delegateDescription: `${getUserName()},${patrolPerson}`,
      id,
    };
    return service.put(
      `${baseUrl}/valveplan?contentParam=${encodeURIComponent(JSON.stringify(data))}`
    );
  },

  getStatisticInfo: params => {
    return service.get(`${baseUrl}/valveplan/valveStatistics`, {
      params,
    });
  },

  deletePlanById: id => {
    return service.delete(`${baseUrl}/valveplan/${id}`);
  },
};

export const api_pipeline = {
  getStatistic: (p = {}) => {
    const { before, end } = getMonthRange();
    const defaultParams = {
      beginDate: before,
      endDate: end,
    };
    const params = {
      ...defaultParams,
      ...p,
      practicalPerson: getUserName(),
      area: getWorkAreaInfo2(),
      // patrolPersonId: getUserId(),
    };
    if (isCharge()) {
      delete params.practicalPerson;
    }

    delete params.patrolPerson;

    return service.get(`${baseUrl}/pipelinepatrol/planCurrentStatus`, { params });
  },
  getList: (p = {}) => {
    const params = {
      ...p,
      ...getPatrolPersonParam(),
      // 增加的区域信息
      workArea: getWorkAreaInfo2(),
    };

    // if (params.patrolStatus === 100) {
    //   // 这个业务没有 patrolStatus 100
    //   delete params.patrolStatus;
    // }

    // 这个业务没有patrolPerson
    // 要根据practicalPerson来
    params.practicalPerson = params.patrolPerson;
    delete params.patrolPerson;

    return service.get(`${baseUrl}/pipelinepatrol/list`, { params });
  },

  getDetail: id => {
    return service.get(`${baseUrl}/pipelinepatrol/${id}`);
  },

  checkIn: (p = {}) => {},

  // 开始巡检
  // step 1
  startCheck: (d = {}) => {
    const data = {
      workArea: getWorkAreaInfo(),
      practicalPerson: getUserName2(),
      practicalPersonId: getUserId2(),
      practicalDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      ...d,
      // patrolDate: d.patrolDate += "-01"
    };
    return service.post(
      `${baseUrl}/pipelinepatrol?contentParam=${encodeURIComponent(JSON.stringify(data))}`,
      {}
    );
  },

  deleteCheck: id => service.delete(`${baseUrl}/pipelinepatrol/${id}`),

  // 采集坐标信息
  // url:/safe/coordinate
  coordinate: async p => {
    return service.post(`${baseUrl}/coordinate`, p);
  },
  putCheckForm: async (d = {}, files, pictureCache) => {
    let locationParams = {};
    const location = await getLoc();
    if (location) {
      locationParams = location;
    }
    const data = {
      ...d,
      ...locationParams,
      practicalPerson: getUserName2(),
      practicalPersonId: getUserId2(),
      practicalDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      // patrolDate: d.patrolDate += "-01"
      workArea: getWorkAreaInfo(),
    };

    delete data.workAreaText;

    // 支持多文件上传
    let formData = undefined;

    if ((files && files.length > 0) || (pictureCache && pictureCache.length > 0)) {
      formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        // MIME类型映射
        const mimeToExtMap = {
          'image/jpeg': '.jpg',
          'image/png': '.png',
          'image/gif': '.gif',
          'image/svg+xml': '.svg',
          'image/webp': '.webp',
          'image/bmp': '.bmp',
          'audio/mpeg': '.mp3',
          'audio/wav': '.wav',
          'audio/ogg': '.ogg',
          'audio/mp4': '.m4a',
          'audio/aac': '.aac',
        };

        // formData.append(`files`, files[i]); // 注意这里的key可以自定义，但后端需要匹配
        formData.append(
          `files`,
          files[i].picBlob,
          `${files[i].name}${mimeToExtMap[files[i].picBlob.type]}`
        ); // 注意这里的key可以自定义，但后端需要匹配
      }
    }

    // 添加三张照片
    if (pictureCache && pictureCache.length > 0) {
      for (let i = 0; i < pictureCache.length; i++) {
        // 文件名称
        let name = `${Date.parse(new Date())}${Math.floor(Math.random() * 1000)}`;

        // MIME类型映射
        const mimeToExtMap = {
          'image/jpeg': '.jpg',
          'image/png': '.png',
          'image/gif': '.gif',
          'image/svg+xml': '.svg',
          'image/webp': '.webp',
          'image/bmp': '.bmp',
          'audio/mpeg': '.mp3',
          'audio/wav': '.wav',
          'audio/ogg': '.ogg',
          'audio/mp4': '.m4a',
          'audio/aac': '.aac',
        };

        if (!pictureCache[i].fileList[0]) {
          continue;
        }

        // formData.append(`files`, files[i]); // 注意这里的key可以自定义，但后端需要匹配
        formData.append(
          `files`,
          pictureCache[i].fileList[0].file,
          `${name}-${pictureCache[i].name}-${mimeToExtMap[pictureCache[i].fileList[0].file.type]}`
        ); // 注意这里的key可以自定义，但后端需要匹配
      }
    }

    // 表面是put
    // 其实需要post
    return service.put(
      `${baseUrl}/pipelinepatrol?contentParam=${encodeURIComponent(JSON.stringify(data))}`,
      formData
    );
  },

  transTaskAnother: (id, patrolPerson, patrolPersonId) => {
    return service.put(`${baseUrl}/pipelinepatrol`, {
      delegateStatus: '1',
      patrolPerson,
      patrolPersonId,
      delegateDescription: `${getUserName()},${patrolPerson}`,
      id,
    });
  },

  getCoordinate(patrolId) {
    return service.get(`${baseUrl}/coordinate/list?pageSize=10000&patrolId=${patrolId}`);
  },

  getStatisticInfo: params => {
    return service.get(`${baseUrl}/pipelinepatrol/patrolCurrent`, {
      params,
    });
  },

  // 获取巡检计划（一个计划对应一个任务）
  getPlan: (p = {}) => {
    const params = {
      ...p,
      ...getPatrolPersonParam(),
      // 增加的区域信息
      workArea: getWorkAreaInfo2(),
      pageSize: 10000,
      patrolType: 5,
    };
    return service.get(`${baseUrl}/plan/list`, {
      params,
    });
  },

  getPipelineData: d => {
    const arr1 = ['centlinemp', 'centlinehp'];
    const promises1 = arr1.map(item =>
      service.post(`${config.pipeserverUrl}/pipeserver/pipeline`, {
        rt: 'asynQuery',
        qt: 1,
        service: item,
        ftArr: ['line'],
        sc: {
          keyword: '',
          data: d,
          type: 'polygon',
        },
        geojson: false,
        split: true,
      })
    );

    const arr2 = ['tiaoya', 'famen'];
    const promises2 = arr2.map(item =>
      service.post(`${config.pipeserverUrl}/pipeserver/pipeline`, {
        rt: item,
        type: 'polygon',
        pg: '0,10',
        keyword: '',
        points: d,
      })
    );

    return Promise.all([...promises1, ...promises2]);
  },

  // 覆盖率
  getCoverage: d => {
    const { type, pipelinePlanId } = d;
    return service.post(`${baseUrl}/plan/getCoverageArea`, {
      type,
      pipelinePlanId,
    });
  },

  // 修改计划覆盖率
  updatePlanCoverage: (id, data, length) => {
    return service.put(`${baseUrl}/plan/updateCoverageRate/${id}/${data}/${length}`, data);
  },

  // 获取管线缓冲区配置
  getPipelineBuffer: () => {
    return service.get(
      `${config.url}/system/config/list?pageNum=1&pageSize=10&configKey=pipeline_buffer`
    );
  },

  getPlanById: id => {
    return service.get(`${baseUrl}/plan/${id}`);
  },
};

// 调压站
export const api_station = {
  getStatistic: (p = {}) => {
    const { before, end } = getMonthRange();
    const defaultParams = {
      beginDate: before,
      endDate: end,
    };
    const params = {
      ...defaultParams,
      ...p,
      practicalPerson: getUserName(),
      area: getWorkAreaInfo2(),
      // patrolPersonId: getUserId(),
    };
    if (isCharge()) {
      delete params.practicalPerson;
    }

    delete params.patrolPerson;

    return service.get(`${baseUrl}/stationpatrol/planCurrentStatus`, { params });
  },
  getList: (p = {}) => {
    const params = {
      ...p,
      ...getPatrolPersonParam(),
      // 增加的区域信息
      workArea: getWorkAreaInfo2(),
    };

    // if (params.patrolStatus === 100) {
    //   // 这个业务没有 patrolStatus 100
    //   delete params.patrolStatus;
    // }

    // 这个业务没有patrolPerson
    // 要根据practicalPerson来
    params.practicalPerson = params.patrolPerson;
    delete params.patrolPerson;

    return service.get(`${baseUrl}/stationpatrol/list`, { params });
  },

  getDetail: id => {
    return service.get(`${baseUrl}/stationpatrol/${id}`);
  },

  checkIn: (params = {}) => {
    return service.get(`${baseUrl}/stationpatrol/checkIn`, { params });
  },

  putCheckForm: async (d = {}, files) => {
    let locationParams = {};
    const location = await getLoc();
    if (location) {
      locationParams = location;
    }
    const data = {
      ...d,
      ...locationParams,
      // practicalPerson: getUserName(),
      practicalPersonId: getUserId(),
      practicalDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      // patrolDate: d.patrolDate += "-01"
      workArea: getWorkAreaInfo(),
    };

    delete data.workAreaText;

    if (data.isFollow) {
      delete data.practicalDate;
    }

    // 支持多文件上传
    let formData = undefined;

    if (files && files.length > 0) {
      formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        let name = `${Date.parse(new Date())}${Math.floor(Math.random() * 1000)}`;
        // MIME类型映射
        const mimeToExtMap = {
          'image/jpeg': '.jpg',
          'image/png': '.png',
          'image/gif': '.gif',
          'image/svg+xml': '.svg',
          'image/webp': '.webp',
          'image/bmp': '.bmp',
          'audio/mpeg': '.mp3',
          'audio/wav': '.wav',
          'audio/ogg': '.ogg',
          'audio/mp4': '.m4a',
          'audio/aac': '.aac',
        };

        // formData.append(`files`, files[i]); // 注意这里的key可以自定义，但后端需要匹配
        formData.append(`files`, files[i], `${name}${mimeToExtMap[files[i].type]}`); // 注意这里的key可以自定义，但后端需要匹配
      }
    }

    if (data.id) {
      return service.put(
        `${baseUrl}/stationpatrol?contentParam=${encodeURIComponent(JSON.stringify(data))}`,
        formData
      );
    } else {
      // 其实需要post
      return service.post(
        `${baseUrl}/stationpatrol?contentParam=${encodeURIComponent(JSON.stringify(data))}`,
        formData
      );
    }
  },

  transTaskAnother: (id, patrolPerson, patrolPersonId) => {
    return service.put(`${baseUrl}/pipelinepatrol`, {
      delegateStatus: '1',
      patrolPerson,
      patrolPersonId,
      delegateDescription: `${getUserName()},${patrolPerson}`,
      id,
    });
  },

  getStatisticInfo: params => {
    return service.get(`${baseUrl}/stationpatrol/stationStatistics`, {
      params,
    });
  },
  deletePlanById: id => {
    return service.delete(`${baseUrl}/stationpatrol/${id}`);
  },
};

// 阴保
export const api_yinbao = {
  checkIn: (params = {}) => {
    return service.get(`${config.url}/equipment/baseElectricDisplacement/checkIn`, { params });
  },
  getStatistic: (p = {}) => {
    const { before, end } = getMonthRange();
    const defaultParams = {
      beginDate: before,
      endDate: end,
    };
    const params = {
      ...defaultParams,
      ...p,
      // patrolPerson: getUserName(),
      // patrolPersonId: getUserId(),
      area: getWorkAreaInfo2(),
    };

    // if (isCharge()) {
    //   delete params.patrolPerson;
    //   delete params.patrolPersonId;
    // }

    return service.get(`${baseUrl}/potentPlan/planCurrentStatus`, { params });
  },
  getList: (p = {}) => {
    const params = {
      ...p,
      // ...getPatrolPersonParam(),
      // 增加的区域信息
      workArea: getWorkAreaInfo2(),
    };
    return service.get(`${baseUrl}/potentPlan/special/list`, { params });
  },

  getDetail: id => {
    return service.get(`${baseUrl}/potentPlan/${id}`);
  },
  putCheckForm: async (d = {}, files, pictureCache) => {
    let locationParams = {};
    const location = await getLoc();
    if (location) {
      locationParams = location;
    }
    const data = {
      ...d,
      ...locationParams,
      // practicalPerson: getUserName(),
      practicalPersonId: getUserId(),
      workArea: getWorkAreaInfo(),
      practicalDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      // patrolDate: d.patrolDate += "-01"
    };

    // 一些可能没用但是有可能出现解析错误的属性
    delete data.valveLocation;
    delete data.roadName;
    delete data.groupName;
    delete data.longitude;
    delete data.latitude;

    if (data.isFollow) {
      delete data.practicalDate;
    }

    // 支持多文件上传
    let formData = undefined;

    if ((files && files.length > 0) || (pictureCache && pictureCache.length > 0)) {
      formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        // 文件名称
        let name = `${Date.parse(new Date())}${Math.floor(Math.random() * 1000)}`;

        // MIME类型映射
        const mimeToExtMap = {
          'image/jpeg': '.jpg',
          'image/png': '.png',
          'image/gif': '.gif',
          'image/svg+xml': '.svg',
          'image/webp': '.webp',
          'image/bmp': '.bmp',
          'audio/mpeg': '.mp3',
          'audio/wav': '.wav',
          'audio/ogg': '.ogg',
          'audio/mp4': '.m4a',
          'audio/aac': '.aac',
        };

        // formData.append(`files`, files[i]); // 注意这里的key可以自定义，但后端需要匹配
        formData.append(`files`, files[i], `${name}${mimeToExtMap[files[i].type]}`); // 注意这里的key可以自定义，但后端需要匹配
      }
    }

    // 添加三张照片
    if (pictureCache && pictureCache.length > 0) {
      for (let i = 0; i < pictureCache.length; i++) {
        // 文件名称
        let name = `${Date.parse(new Date())}${Math.floor(Math.random() * 1000)}`;

        // MIME类型映射
        const mimeToExtMap = {
          'image/jpeg': '.jpg',
          'image/png': '.png',
          'image/gif': '.gif',
          'image/svg+xml': '.svg',
          'image/webp': '.webp',
          'image/bmp': '.bmp',
          'audio/mpeg': '.mp3',
          'audio/wav': '.wav',
          'audio/ogg': '.ogg',
          'audio/mp4': '.m4a',
          'audio/aac': '.aac',
        };

        // formData.append(`files`, files[i]); // 注意这里的key可以自定义，但后端需要匹配
        formData.append(
          `files`,
          pictureCache[i].fileList[0].file,
          `${name}-${pictureCache[i].name}-${mimeToExtMap[pictureCache[i].fileList[0].file.type]}`
        ); // 注意这里的key可以自定义，但后端需要匹配
      }
    }

    return service.put(`${baseUrl}/potentPlan`, data);
  },

  transTaskAnother: (id, patrolPerson, patrolPersonId) => {
    const data = {
      delegateStatus: '1',
      patrolPerson,
      patrolPersonId,
      delegateDescription: `${getUserName()},${patrolPerson}`,
      id,
    };
    return service.put(`${baseUrl}/potentPlan`, data);
  },

  getStatisticInfo: params => {
    return service.get(`${baseUrl}/potentPlan/stubStatistics`, {
      params,
    });
  },

  deletePlanById: id => {
    return service.delete(`${baseUrl}/valveplan/${id}`);
  },
};

// 改造后
export const api_plan = {
  getAllPlan(params = {}) {
    return service.get(`${baseUrl}/plan/list`, {
      params: {
        pageNum: 1,
        pageSize: 10000,
        ...getPatrolPersonParam(),
        workArea: getWorkAreaInfo2(),
        planStatus: '1',
        currentDate: dayjs().format('YYYY-MM-DD'),
        ...params,
      },
    });
  },

  getEquipment(params) {
    return service.get(`${baseUrl}/taskPoint/listByPlanId`, {
      // return service.get(`${baseUrl}/taskPoint/list`, {
      params: {
        pageNum: 1,
        pageSize: 100,
        userId: getUserId2(),
        ...params, // 后面要用

        // 下面测试数据
        // planId: 4303,
        // type: 2,
        // userId: 6061,
      },
    });
  },

  updatePlan(data) {
    return service.put(`${baseUrl}/plan`, data);
  },

  // 更新计划一堆数
  updatePlanCnt(params) {
    return service.put(`${baseUrl}/plan/updateCompletedRateAndCnt`, null, { params });
  },

  // 快巡点
  getKxPoint(id) {
    // return service.get(`${baseUrl}/patrolPoint/patrolPointList`, {
    return service.get(`${baseUrl}/taskPoint/list`, {
      params: {
        pageNum: 1,
        pageSize: 10000,
        ext1: '2',
        controlId: id,
      },
    });
  },

  // 获取快巡完成点
  getKxFinishPoint(params) {
    return service.get(`${baseUrl}/patrolpointPlan/getCompletedPoints`, {
      params: {
        pageNum: 1,
        pageSize: 10000,
        rightdate: dayjs().format('YYYY-MM-DD'),
        ...params,
        // groupName=1&planId=2&rightdate=2024-01-01
      },
    });
  },

  getLeaderEquipment(params) {
    return service.get(`${baseUrl}/taskPoint/listByPlanIdAreaAdmin`, {
      params: {
        pageNum: 1,
        pageSize: 10000,
        area: getWorkAreaInfo2(),
        ...params,
      },
    });
  },

  // 获取快巡缓冲区配置
  getKxBuffer: () => {
    return service.get(
      `${config.url}/system/config/list?pageNum=1&pageSize=10&configKey=patrolpoint_pipeline_buffer`
    );
  },

  // 新增快巡记录点
  postKxRecordPoint(data) {
    return service.post(
      `${baseUrl}/patrolpointPlan/batchAddPatrolPointPlan`,
      data.map(i => ({
        ...i,
        practicalPerson: getUserName2(),
        practicalPersonId: getUserId2(),
        practicalDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      }))
    );
  },

  // 获取快巡记录点列表
  getKxRecordPointList(params) {
    return service.get(`${baseUrl}/patrolpointPlan/list`, {
      params: {
        pageNum: 1,
        pageSize: 10000,
        ...params,
      },
    });
  },

  // 快巡采集坐标信息
  // url:/safe/coordinate
  kxCoordinate: async p => {
    return service.post(`${baseUrl}/pointCoordinate`, p);
  },
  // 快巡采集坐标信息
  // url:/safe/coordinate
  getKxCoordinate: async params => {
    return service.get(`${baseUrl}/pointCoordinate/list`, {
      params: {
        pageNum: 1,
        pageSize: 10000,
        ...params,
      },
    });
  },

  // 取消快巡的几个接口
  // 删除记录
  deleteCanceledPoints: data => {
    return service.delete(`${baseUrl}/patrolpointPlan/deleteCanceledPoints`, { data });
  },
  // 删除轨迹点
  deleteByBatchCode: batchCode => {
    return service.delete(`${baseUrl}/pointCoordinate/deleteByBatchCode/${batchCode}`);
  },

  // 删除记录2
  deleteByBatchCode2: batchCode => {
    return service.delete(`${baseUrl}/patrolpointPlan/deleteByBatchCode/${batchCode}`);
  },
};
