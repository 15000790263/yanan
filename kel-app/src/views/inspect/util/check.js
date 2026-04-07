export function getPatrolStatus(data) {
  // console.log('------', data);
  let isOk = true;
  const keys = Object.keys(data);
  for (const key of keys) {
    if (key === 'result' || key === 'problemDescp' || data[key] === '') continue;
    const value = +data[key];
    if (value === 0) {
      isOk = false;
      break;
    }
  }

  return {
    patrolStatus: isOk ? 1 : 2,
  };
}
