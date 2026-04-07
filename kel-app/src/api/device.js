import service from '../utils/service';
import config from '../config';

//	获取菜单
export const getMenu = () => service.get(`${config.url}/system/menu/getRouters`);

// 获取列表
export const getPipeList = data => {
  const { pageNum = 1, pageSize = 10, pipelinetypeid, ...others } = data;
  let othersStr = '';
  Object.keys(others).forEach(item => {
    othersStr += `&${item}=${others[item]}`;
  });
  return service.get(
    `${config.url}/equipment/basepipeline/basepipelinelist?pageNum=${pageNum}&pageSize=${pageSize}&pipelinetypeid=${pipelinetypeid}${othersStr}`
  );
};

export const getDictType = dictType =>
  service.get(`${config.url}/system/dict/data/list?pageNum=1&pageSize=9999&dictType=${dictType}`);

// 获取统计数据
export const getSummaryData = () =>
  service.get(`${config.url}/equipment/equipmentstatistics/basepipelinelength`);

// 获取成套设备列表
export const getWholeSetList = data => {
  const { pageNum = 1, pageSize = 10, equipmenttypeid, url, ...others } = data;
  let othersStr = '';
  Object.keys(others).forEach(item => {
    othersStr += `&${item}=${others[item]}`;
  });

  if (equipmenttypeid == '6015') {
    return service.get(
      `${config.url}/${url}?pageNum=${pageNum}&pageSize=${pageSize}&equipmenttypeid=${equipmenttypeid}${othersStr}`
    );
  }
  return service.get(
    `${config.url}/equipment${url}?pageNum=${pageNum}&pageSize=${pageSize}&equipmenttypeid=${equipmenttypeid}${othersStr}`
  );
};

//	获取基本设备树
export const getDeviceTree = () =>
  service.get(`${config.url}/equipment/equipmentbaseinfo/getequipmenttree?filterId=1005`);

// 获取基本设备列表
export const getDeviceList = data => {
  const { pageNum = 1, pageSize = 10, equipmenttypeid, url, ...others } = data;
  let othersStr = '';
  Object.keys(others).forEach(item => {
    othersStr += `&${item}=${others[item]}`;
  });
  return service.get(
    `${config.url}/equipment${url}?pageNum=${pageNum}&pageSize=${pageSize}&equipmenttypeid=${equipmenttypeid}${othersStr}`
  );
};

// 获取特种设备列表
export const getTDeviceList = data => {
  const { pageNum = 1, pageSize = 10, equipmenttypeid, ...others } = data;
  let othersStr = '';
  Object.keys(others).forEach(item => {
    othersStr += `&${item}=${others[item]}`;
  });
  return service.get(
    `${config.url}/equipment/basepressurevesselcontroller/basepressurevessellist?pageNum=${pageNum}&pageSize=${pageSize}&equipmenttypeid=${equipmenttypeid}${othersStr}`
  );
};

// 模糊查询所有某类设备所有设备信息
export const listDeviceBasicSearch = (query, type) => {
  let url = '';
  if (type === 'TT') {
    url = '/equipment/baseautomaticcontrol/baseautomaticcontrollist';
  } else if (type === 'FI') {
    url = '/equipment/basemeasuringinstrument/basemeasuringinstrumentlist';
  } else if (type === 'BT' || type === 'DJ' || type === 'AE' || type === 'FL') {
    url = '/equipment/basemeasuringinstrument/basedetectioninstrumentlist';
  } else if (type === 'CL') {
    url = '/equipment/baseequipmentspecial/baseequipmentspeciallist';
  } else if (type === 'RQ') {
    url = '/equipment/basepressurevesselcontroller/basepressurevessellist';
  } else if (type === 'GL') {
    url = '/equipment/baseequipmentfilter/baseequipmentfilterlist';
  } else if (type === 'KQYSJ') {
    url = '/equipment/baseequipmentelectrical/baseequipmentelectricallist';
  } else if (type === 'ZC') {
    url = '/equipment/equipmentverify/basestationlist';
  } else if (type === 'HPA' || type === 'HHA' || type === 'MPA' || type === 'LPW') {
    url = '/equipment/basepipeline/basepipelinelist';
  } else if (type === 'A' || type === 'Z' || type === 'E') {
    url = '/equipment/baseequipmentvalve/baseEquipmentValveInfoListAll';
  } else if (type === 'TYB') {
    url = '/equipment/basemeasuringinstrument/baseequipmentregulatorlist';
  } else if (type === 'RSU') {
    url = '/equipment/equipmentverify/basestationlist';
  } else if (type === 'FJ') {
    url = '/equipment/basevalvewell/baseValveWellListAll';
  } else if (type === 'GD') {
    url = '/equipment/baseequipmentvalve/baseequipmentvalvelist';
  } else if (type === 'CP' || type === 'LE') {
    url = '/equipment/baseequipmentvalve/baseequipmentvalvelist';
  } else if (type === 'WT') {
    url = '/equipment/baseLawEnforcement/baseEquipmentBlindListAll';
  } else if (type === 'EDC') {
    url = '/equipment/basemeasuringinstrument/baseEquipmentReleaseListAll';
  } else if (type === 'HZN' || type === 'LET') {
    url = '/equipment/baseequipmentelectrical/baseequipmentelectricallist';
  } else if (type === 'TP') {
    url = '/equipment/equipmentProtectionPileControl/equipmentProtectionPileListAll';
  } else if (type === 'YBZ') {
    url = '/equipment/equipmentProtectionPileControl/equipmentProtectionPileListAll';
  } else if (type === 'X') {
    url = '/equipment/baseInspectionVehicle/baseCathodicStationListAll';
  } else if (type === 'T') {
    url = '/equipment/baseInspectionVehicle/baseCathodicStationListAll';
  } else if (type === 'EG') {
    url = '/equipment/baseElectricDisplacement/baseElectricDisplacementListAll';
  } else if (type === 'FA') {
    url = '/equipment/baseFlameArrester/baseFlameArresterListAll';
  } else if (type === 'BPT') {
    url = '/equipment/baseEquipmentBlind/baseEquipmentBlindListAll';
  } else if (type === 'MPD') {
    url = '/equipment/baseInsulatedJoint/baseInsulatedJointListAll';
  } else if (type === 'FE') {
    url = '/equipment/baseEquipmentExtinguisher/baseEquipmentExtinguisherListAll';
  } else if (type === 'RTD') {
    url = '/equipment/baseEquipmentTripod/baseEquipmentTripodListAll';
  } else if (type === 'QT') {
    url = '/equipment/baseGasDetectionController/baseGasDetectionListAll';
  } else if (type === 'PT') {
    url = '/equipment/basePressureTransmitter/basePressureTransmitterListAll';
  } else if (type === 'PPR') {
    url = '/equipment/BaseEquipmentAirController/baseEquipmentAirListAll';
  } else if (type === 'BBJ') {
    url = '/equipment/baseEquipmentSoundAlarmController/baseEquipmentBlindListAll';
  } else if (type === 'MT') {
    url = '/equipment/baseGasDetectionController/baseGasDetectionListAll';
  }

  return service.get(`${config.url}/${url}`, {
    params: query,
  });
};

// 获取详情
export const getDetailByDataId = dataId =>
  service.get(`${config.url}/equipment/basepipeline/basepipelinedetailbyid?dataid=${dataId}`);

// 调压站详情
export const getTYZDetailByDataId = dataId =>
  service.get(`${config.url}/equipment/equipmentverify/basestationdetailbyid?dataid=${dataId}`);

// 阴保站详情
export const getYBZDetailByDataId = dataId =>
  service.get(
    `${config.url}/equipment/basecathodicstationcontroller/baseautomaticcontrolinfobyid?dataId=${dataId}`
  );

// 调压箱(柜)详情
export const getTYQDetailByDataId = dataId =>
  service.get(
    `${config.url}/equipment/basemeasuringinstrument/baseequipmentregulatorbyno?dataId=${dataId}`
  );

// 阀门井详情
export const getFMJDetailByDataId = dataId =>
  service.get(`${config.url}/equipment/basevalvewell/baseequipmentvalveinfobyid?dataId=${dataId}`);

// 加臭设备详情
export const getJCSBDetailByDataId = dataId =>
  service.get(
    `${config.url}/equipment/baseEquipmentDeodorizing/baseEquipmentDeodorizingInfoById?dataId=${dataId}`
  );

// 激光云台详情
export const getJGYTDetailByDataId = id => service.get(`${config.url}/safe/jgyt/device/${id}`);

// 特种设备详情
export const getTZSBDetailByDataId = dataId =>
  service.get(
    `${config.url}/equipment/basepressurevesselcontroller/basepressurevesselinfobyid?dataId=${dataId}`
  );

// 获取全部设备树
export const getDeviceTreeAll = () =>
  service.get(
    `${config.url}/equipment/equipmentmaintain/getequipmentclassnamelist?isMaintenance=1`
  );

// 根据equipmentcode获取对应的调压箱设备
export const getRegulatorByScan = equipmenttypeid =>
  service.get(
    `${config.url}/equipment/basemeasuringinstrument/baseequipmentregulatorlist?pageNum=1&pageSize=20&equipmenttypeid=5001&equipmentsyscode=${equipmenttypeid}`
  );

export const baseBuildingNetOrganizationListAll = () =>
  service.get(`${config.url}/equipment/baseBuildingNetController/baseBuildingOrganizationListAll`);

// 新增调压箱(柜)
export const addRegulator = data =>
  service.post(`${config.url}/equipment/basemeasuringinstrument/baseequipmentregulatoradd`, data);

// 修改调压箱(柜)
export const updateRegulator = data =>
  service.post(
    `${config.url}/equipment/basemeasuringinstrument/baseequipmentregulatorupdate`,
    data
  );

// 调压箱(柜)状态变更
export const regulatorStatusChange = params =>
  service.get(`${config.url}/safe/plan/regulatorStatusChange`, { params });

/*************  维保检  *****************/

// 获取设备维修列表
export const getDeviceRepair = data => {
  const { pageNum = 1, pageSize = 10, equipmentcode } = data;
  return service.get(
    `${config.url}/equipment/equipmentmaintain/equipmentmaintainlist?pageNum=${pageNum}&pageSize=${pageSize}&equipmentcode=${equipmentcode}`
  );
};

// 获取设备维修列表
export const getDeviceRepairDetail = id =>
  service.get(`${config.url}/equipment/equipmentmaintain/equipmentmaintaindetailbyid?id=${id}`);

/* *******************    设备扫码查询     ************************ */
// 根据equipmentcode获取对应的调压站设备
export const getRegulatorStationByScan = equipmentcode =>
  service.get(
    `${config.url}/equipment/equipmentverify/basestationlist?pageNum=1&pageSize=10&equipmenttypeid=5005&equipmentsyscode=${equipmentcode}`
  );

// 根据equipmentcode获取对应的阴保站设备
export const getYinBaoStationByScan = equipmentcode =>
  service.get(
    `${config.url}/equipment/basecathodicstationcontroller/basecathodicstationlist?pageNum=1&pageSize=10&equipmenttypeid=6011&equipmentcode=${equipmentcode}`
  );

// 根据equipmentcode获取对应的阀井设备
export const getWallByScan = equipmentcode =>
  service.get(
    `${config.url}/equipment/basevalvewell/basevalvewelllist?pageNum=1&pageSize=10&equipmenttypeid=5010&equipmentsyscode=${equipmentcode}`
  );

// 根据equipmentcode获取对应的加臭设备
export const getJiaChouByScan = equipmentcode =>
  service.get(
    `${config.url}/equipment/baseEquipmentDeodorizing/baseEquipmentDeodorizingList?pageNum=1&pageSize=10&equipmenttypeid=6014&equipmentsyscode=${equipmentcode}`
  );

/* ************************   查询设备巡检信息   ********************************** */
// 查询调压箱巡检信息
export const getTYXInspectInfoByCode = equipmentsyscode =>
  service.get(
    `${config.url}/safe/regulatorplan/list?pageNum=1&pageSize=100&equipmentsyscode=${equipmentsyscode}`
  );

// 查询阀井巡检信息
export const getFMJInspectInfoByCode = equipmentsyscode =>
  service.get(
    `${config.url}/safe/valveplan/list?pageNum=1&pageSize=100&equipmentsyscode=${equipmentsyscode}`
  );

// 查询调压站巡检信息
export const getTYZInspectInfoByCode = equipmentsyscode =>
  service.get(
    `${config.url}/safe/stationpatrol/list?pageNum=1&pageSize=100&equipmentsyscode=${equipmentsyscode}`
  );

// 调压站、调压箱新增维修
export const repairTYZ = data => {
  return service.post(`${config.url}/equipment/equipmentmaintain/equipmentmaintainaddbatch`, data);
};

// 查询保养项
export const getHealthItem = params => {
  return service.get(`${config.url}/equipment/equipmentupkeepterm/equipmentupkeeptermlist`, {
    params: {
      pageSize: 10000,
      ...params,
    },
  });
};

// 调压箱闲新增一级保养
export const addOneHealth = data => {
  return service.post(`${config.url}/equipment/equipmentupkeep/equipmentupkeepaddnew`, data);
};

// 图片上传关联
export const fileManage = data => {
  return service.post(`${config.url}/equipment/filemanage`, data);
};

// 图片上传关联
export const getFilePic = pid => {
  return service.get(`${config.url}/equipment/filemanage/list?pid=${pid}`);
};

// 删除照片
export const delFilePic = fileIds => {
  return service.delete(`${config.url}/equipment/filemanage/${fileIds} `);
};

// 获取物资设备列表
export const getMaterialList = data => {
  const { pageNum = 1, pageSize = 10, equipmenttypeid, url, ...others } = data;
  let othersStr = '';
  Object.keys(others).forEach(item => {
    othersStr += `&${item}=${others[item]}`;
  });
  return service.get(
    `${config.url}/equipment${url}?pageNum=${pageNum}&pageSize=${pageSize}&equipmenttypeid=${equipmenttypeid}${othersStr}`
  );
};

// 车辆详情
export const getCLDetailByDataId = dataId =>
  service.get(
    `${config.url}/equipment/baseequipmentspecial/baseequipmentspecialdetailbyid?dataid=${dataId}`
  );

// 检测设备详情
export const getJCSB2DetailByDataId = dataId =>
  service.get(
    `${config.url}/equipment/basemeasuringinstrument/basedetectioninstrumentinfobyid?dataId=${dataId}`
  );

// 救援物资详情
export const getJXWZDetailByDataId = dataId =>
  service.get(`${config.url}/equipment/fixedasset/${dataId}`);

// 备品备件详情
export const getBPBJDetailByDataId = id =>
  service.get(`${config.url}/equipment/equipmentspareparts/equipmentsparepartsdetailbyid?id=${id}`);

// 电气设备详情
export const getDQSBDetailByDataId = dataId =>
  service.get(
    `${config.url}/equipment/basemeasuringinstrument/basedetectioninstrumentinfobyid?dataId=${dataId}`
  );

// 通讯设备详情
export const getTXSBDetailByDataId = dataId =>
  service.get(
    `${config.url}/equipment/basemeasuringinstrument/basedetectioninstrumentinfobyid?dataId=${dataId}`
  );

// 其他设备详情
export const getQTSBDetailByDataId = dataId =>
  service.get(
    `${config.url}/equipment/baseEquipmentBlind/baseEquipmentBlindInfoById?dataId=${dataId}`
  );

// 获取阴保设备列表
export const getProtectionsList = data => {
  const { pageNum = 1, pageSize = 10, equipmenttypeid, url, ...others } = data;
  let othersStr = '';
  Object.keys(others).forEach(item => {
    othersStr += `&${item}=${others[item]}`;
  });
  return service.get(
    `${config.url}/equipment${url}?pageNum=${pageNum}&pageSize=${pageSize}&equipmenttypeid=${equipmenttypeid}${othersStr}`
  );
};
// 恒电位仪详情
export const getEgDetailByDataId = id => {
  return service.get(
    `${config.url}/equipment/baseElectricDisplacement/baseElectricDisplacementInfoById?dataId=${id}`
  );
};
// 测试桩详情
export const getTpDetailByDataId = id => {
  return service.get(
    `${config.url}/equipment/equipmentProtectionPileControl/equipmentprotectionpileinfobyid?dataId=${id}`
  );
};
// 消防设备详情
export const getFeDetailByDataId = id => {
  return service.get(
    `${config.url}/equipment/baseEquipmentExtinguisher/baseEquipmentExtinguisherInfoById?dataId=${id}`
  );
};
// 消防设备详情
export const getIjDetailByDataId = id => {
  return service.get(
    `${config.url}/equipment/baseInsulatedJoint/baseInsulatedJointInfoById?dataId=${id}`
  );
};

// 获取特种设备列表
export const getSpecialList = data => {
  const { pageNum = 1, pageSize = 10, equipmenttypeid, url, ...others } = data;
  let othersStr = '';
  Object.keys(others).forEach(item => {
    othersStr += `&${item}=${others[item]}`;
  });
  return service.get(
    `${config.url}/equipment${url}?pageNum=${pageNum}&pageSize=${pageSize}&equipmenttypeid=${equipmenttypeid}${othersStr}`
  );
};

// 汇管设备详情
export const getHGSBDetailByDataId = dataId =>
  service.get(
    `${config.url}/equipment/baseequipmentfilter/baseequipmentfilterinfobyid?dataId=${dataId}`
  );

// 过滤器详情
export const getGLQSBDetailByDataId = dataId =>
  service.get(
    `${config.url}/equipment/baseequipmentfilter/baseequipmentfilterinfobyid?dataId=${dataId}`
  );

// 工业管道详情
export const getGYGDSBDetailByDataId = dataId =>
  service.get(
    `${config.url}/equipment/baseequipmentfilter/baseequipmentfilterinfobyid?dataId=${dataId}`
  );

// 安全附件设备详情
export const getAQFJSBDetailByDataId = dataId =>
  service.get(
    `${config.url}/equipment/baseequipmentvalve/basebaseequipmentvalveinfobyid?dataId=${dataId}`
  );

// 根据equipmentcode获取对应的检测设备
export const getJianCeByScan = (equipmentcode, typeValue) =>
  service.get(
    `${config.url}/equipment/basemeasuringinstrument/basedetectioninstrumentlist?equipmentsyscode=${equipmentcode}&equipmenttypeid=${typeValue}`
  );

// 根据equipmentcode获取对应的电气设备
export const getDianQiByScan = (equipmentcode, typeValue) =>
  service.get(
    `${config.url}/equipment/basemeasuringinstrument/basedetectioninstrumentlist?equipmentsyscode=${equipmentcode}&equipmenttypeid=${typeValue}`
  );

// 根据equipmentcode获取对应的通讯设备
export const getTongXunByScan = (equipmentcode, typeValue) =>
  service.get(
    `${config.url}/equipment/basemeasuringinstrument/basedetectioninstrumentlist?equipmentsyscode=${equipmentcode}&equipmenttypeid=${typeValue}`
  );

// 根据equipmentcode获取对应的恒电位仪设备
export const getHDWYByScan = equipmentcode =>
  service.get(
    `${config.url}/equipment/baseElectricDisplacement/baseElectricDisplacementList?equipmentsyscode=${equipmentcode}`
  );

// 根据equipmentcode获取对应的测试桩设备
export const getCSZByScan = equipmentcode =>
  service.get(
    `${config.url}/equipment/equipmentProtectionPileControl/equipmentprotectionpilelist?equipmentsyscode=${equipmentcode}`
  );

export const getCbsDetailByDataId = dataId => {
  return service.get(
    `${config.url}/equipment/baseautomaticcontrol/baseautomaticcontrolinfobyid?dataId=${dataId}`
  );
};

export const getCbsByScan = equipmenttypeid =>
  service.get(
    `${config.url}/equipment/baseautomaticcontrol/baseautomaticcontrollist?pageNum=1&pageSize=20&equipmenttypeid=7777&equipmentsyscode=${equipmenttypeid}`
  );

export const getYLRQByScan = equipmenttypeid =>
  service.get(
    `${config.url}/equipment/baseequipmentfilter/baseequipmentfilterlist?pageNum=1&pageSize=10&equipmentsyscode=${equipmenttypeid}`
  );

export const getAQFJByScan = equipmenttypeid =>
  service.get(
    `${config.url}/equipment/baseequipmentvalve/baseequipmentvalvelist?pageNum=1&pageSize=10&equipmentsyscode=${equipmenttypeid}`
  );

export const getCLByScan = equipmenttypeid =>
  service.get(
    `${config.url}/equipment/baseequipmentspecial/baseequipmentspeciallist?pageNum=1&pageSize=10&equipmentsyscode=${equipmenttypeid}`
  );

export const getJYWZByScan = equipmenttypeid =>
  service.get(
    `${config.url}/equipment/fixedasset/list?pageNum=1&pageSize=10&equipmentsyscode=${equipmenttypeid}`
  );

export const getBPBJByScan = equipmenttypeid =>
  service.get(
    `${config.url}/equipment/equipmentspareparts/equipmentsparepartslist?pageNum=1&pageSize=10&equipmentsyscode=${equipmenttypeid}`
  );

export const getQTByScan = equipmenttypeid =>
  service.get(
    `${config.url}/equipment/baseEquipmentBlind/baseEquipmentBlindList?pageNum=1&pageSize=10&equipmentsyscode=${equipmenttypeid}`
  );

export const getXFSBByScan = equipmenttypeid =>
  service.get(
    `${config.url}/equipment/baseEquipmentExtinguisher/baseEquipmentExtinguisherList?pageNum=1&pageSize=10&equipmentsyscode=${equipmenttypeid}`
  );

export const getJYJTByScan = equipmenttypeid =>
  service.get(
    `${config.url}/equipment/baseInsulatedJoint/baseInsulatedJointList?pageNum=1&pageSize=10&equipmentsyscode=${equipmenttypeid}`
  );

export const getJGYTByScan = () =>
  service.get(`${config.url}/safe/jgyt/device/list?pageNum=1&pageSize=1000&equipmenttypeid=6015`);

export const getJGYTList = () => service.get(`${config.url}/safe/jgyt/station/list?pageSize=1000`);

// 获取激光云台维修记录
export const getRepairList = equipmentsyscode =>
  service.get(
    `${config.url}/equipment/equipmentmaintain/equipmentmaintainlist?pageNum=1&pageSize=10000&equipmentsyscode=${equipmentsyscode}`
  );

// 获取激光云台保养记录
export const getHealthList = equipmentsyscode =>
  service.get(
    `${config.url}/equipment/equipmentupkeep/equipmentupkeeplist?pageNum=1&pageSize=10000&equipmentsyscode=${equipmentsyscode}`
  );

// 获取楼东关系
export const getBuildingRelation = equipmentsyscode =>
  service.get(
    `${config.url}/equipment/baseBuildingOrganizationControl/baseBuildingOrganizationList?boxcode=${equipmentsyscode}`
  );

// 获取楼东关系详情
export const getBuildingRelationDetail = buildingid =>
  service.get(`${config.url}/equipment/buildinguser/list?buildingid=${buildingid}`);

// 获取全部楼栋信息
export const getAllBuilding = () =>
  service.get(
    `${config.url}/equipment/baseBuildingOrganizationControl/baseBuildingOrganizationListAll`
  );

// 更新楼栋信息
export const updateBuilding = data =>
  service.post(
    `${config.url}/equipment/baseBuildingOrganizationControl/baseBuildingOrganizationUpdate`,
    data
  );

// 批量更新楼栋信息
export const updateBuildingMore = data =>
  service.post(
    `${config.url}/equipment/baseBuildingOrganizationControl/updateEquipmentsyscodeBatch`,
    data
  );

// 获取楼东关系详情
export const getBuildingUser = params =>
  service.get(`${config.url}/equipment/buildinguser/list`, { params });

// 更新用户信息
export const updateBuildingUser = data => service.put(`${config.url}/equipment/buildinguser`, data);
