// 调压箱
export const list_regulator_adapter = list => {
  return list.map(item => {
    return {
      title: item.regulatorNumber || '测试',
      desc: item.regulatorLocation,
      id: item.id,
      ...item,
    };
  });
};

// 阀井
export const list_well_adapter = list => {
  return list.map(item => {
    return {
      title: item.valveNumber || '测试',
      desc: item.valveLocation,
      id: item.id,
      ...item,
    };
  });
};

export const list_pipeline_adapter = list => {
  return list.map(item => {
    return {
      title: item.pipelineName || item.inspectArea,
      // desc: (item.startingAddress ?? '起始') + ' - ' + (item.destinationAddress ?? '结束'),
      desc:
        item.startingAddress && item.destinationAddress
          ? item.startingAddress + ' - ' + item.destinationAddress
          : ' ',
      id: item.id,
      ...item,
    };
  });
};

export const list_station_adapter = list => {
  return list.map(item => {
    return {
      title: item.stationName,
      // desc: (item.startingAddress ?? '起始') + ' - ' + (item.destinationAddress ?? '结束'),
      // desc: item.entryTime + ' - ' + item.createTime,
      desc: '',
      id: item.id,
      ...item,
    };
  });
};

export const list_yinbao_adapter = list => {
  return list.map(item => {
    return {
      title: item.potentNumber,
      desc: item.potentName,
      id: item.id,
      ...item,
    };
  });
};
