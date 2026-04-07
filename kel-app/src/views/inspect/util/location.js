import { getLocation } from '../../../utils/cordova-tools';

const testLocation = {
  // longitude: 108.96723967,
  // latitude: 34.1636239,
  // longitude: 86.1550345,
  // latitude: 41.7487369,
  longitude: 86.18586,
  latitude: 41.7347,
};

export async function getLoc() {
  if (!window.cordova) {
    console.warn('这里是测试环境拿到的假的定位数据:', testLocation);
    return testLocation;
  }

  const location = await getLocation();

  if (location) return location;
}
