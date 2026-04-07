import { qrScanner2 } from '@/utils/qrscanner2';
import {
  getRegulatorByScan,
  getRegulatorStationByScan,
  getYinBaoStationByScan,
  getWallByScan,
  getJiaChouByScan,
  getJianCeByScan,
  getDianQiByScan,
  getTongXunByScan,
  getHDWYByScan,
  getCSZByScan,
  getCbsByScan,
} from '@/api/device.js';
import {
  getAQFJByScan,
  getBPBJByScan,
  getCLByScan,
  getJYJTByScan,
  getJYWZByScan,
  getQTByScan,
  getXFSBByScan,
  getYLRQByScan,
  getJGYTByScan,
} from '../../../api/device';

export function useMethod() {
  const router = useRouter();
  async function handleScan() {
    const res = await qrScanner2();
    if (res) {
      const [typeValue, equipmentsyscode] = res.split(':');

      // 调压箱
      if (typeValue === '5001') {
        const list = await getRegulatorByScan(equipmentsyscode);
        const data = list.data.rows.find(item => item.equipmentsyscode === equipmentsyscode);
        if (data) {
          console.log(data);
          router.push(
            `/device/whole-set-detail?dataId=${data.dataid}&typeValue=5001&equipmentcode=${data.equipmentcode}&equipmentsyscode=${equipmentsyscode}`
          );
        }
      }

      // 调压站
      if (typeValue === '5005') {
        const list = await getRegulatorStationByScan(equipmentsyscode);
        const data = list.data.rows.find(item => item.equipmentsyscode === equipmentsyscode);
        if (data) {
          router.push(
            `/device/whole-set-detail?dataId=${data.dataid}&typeValue=5005&equipmentcode=${data.equipmentcode}&equipmentsyscode=${equipmentsyscode}`
          );
        }
      }

      // // 阴保站
      // if (typeValue === '6011') {
      //   const list = await getYinBaoStationByScan(equipmentcode);
      //   const data = list.data.rows.find(item => item.equipmentcode === equipmentcode);
      //   if (data) {
      //     router.push(`/device/whole-set-detail?dataId=${data.dataid}&typeValue=${typeValue}`);
      //   }
      // }

      // 阀井
      if (typeValue === '5010') {
        const list = await getWallByScan(equipmentsyscode);
        const data = list.data.rows.find(item => item.equipmentsyscode === equipmentsyscode);
        if (data) {
          router.push(
            `/device/whole-set-detail?dataId=${data.dataid}&typeValue=${typeValue}&equipmentcode=${data.equipmentcode}&equipmentsyscode=${equipmentsyscode}`
          );
        }
      }

      // 加臭
      if (typeValue === '6014') {
        const list = await getJiaChouByScan(equipmentsyscode);
        const data = list.data.rows.find(item => item.equipmentsyscode === equipmentsyscode);
        if (data) {
          router.push(
            `/device/whole-set-detail?dataId=${data.dataid}&typeValue=${typeValue}&equipmentcode=${data.equipmentcode}&equipmentsyscode=${equipmentsyscode}`
          );
        }
      }

      // 检测设备
      if (typeValue === '5021') {
        const list = await getJianCeByScan(equipmentsyscode, typeValue);
        const data = list.data.rows.find(item => item.equipmentsyscode === equipmentsyscode);
        if (data) {
          router.push(
            `/device/material-detail?dataId=${data.dataid}&typeValue=${typeValue}&equipmentcode=${data.equipmentcode}&equipment=${data.equipment}&equipmentsyscode=${data.equipmentsyscode}&espId=${data.espId}`
          );
        }
      }

      // 电气设备
      if (typeValue === '4699') {
        const list = await getDianQiByScan(equipmentsyscode, typeValue);
        const data = list.data.rows.find(item => item.equipmentsyscode === equipmentsyscode);
        if (data) {
          router.push(
            `/device/material-detail?dataId=${data.dataid}&typeValue=${typeValue}&equipmentcode=${data.equipmentcode}&equipment=${data.equipment}&equipmentsyscode=${data.equipmentsyscode}&espId=${data.espId}`
          );
        }
      }

      // 通讯设备
      if (typeValue === '5029') {
        const list = await getTongXunByScan(equipmentsyscode, typeValue);
        const data = list.data.rows.find(item => item.equipmentsyscode === equipmentsyscode);
        if (data) {
          router.push(
            `/device/material-detail?dataId=${data.dataid}&typeValue=${typeValue}&equipmentcode=${data.equipmentcode}&equipment=${data.equipment}&equipmentsyscode=${data.equipmentsyscode}&espId=${data.espId}`
          );
        }
      }

      // 恒电位仪
      if (typeValue === '5026') {
        const list = await getHDWYByScan(equipmentsyscode);
        const data = list.data.rows.find(item => item.equipmentsyscode === equipmentsyscode);
        if (data) {
          router.push(
            `/device/protection-detail?dataId=${data.dataid}&typeValue=${typeValue}&equipmentcode=${data.equipmentcode}&equipment=${data.equipment}&equipmentsyscode=${data.equipmentsyscode}&espId=${data.espId}`
          );
        }
      }

      // 测试桩
      if (typeValue === '5025') {
        const list = await getCSZByScan(equipmentsyscode);
        const data = list.data.rows.find(item => item.equipmentsyscode === equipmentsyscode);
        if (data) {
          router.push(
            `/device/protection-detail?dataId=${data.dataid}&typeValue=${typeValue}&equipmentcode=${data.equipmentcode}&equipment=${data.equipment}&equipmentsyscode=${data.equipmentsyscode}&espId=${data.espId}`
          );
        }
      }
      // 承包商设备
      if (typeValue === '7777') {
        const list = await getCbsByScan(equipmentsyscode);
        const data = list.data.rows.find(item => item.equipmentsyscode === equipmentsyscode);
        if (data) {
          router.push(
            `/device/supplier-detail?dataId=${data.dataid}&typeValue=${typeValue}&equipmentcode=${data.equipmentcode}&equipment=${data.equipment}&equipmentsyscode=${data.equipmentsyscode}&espId=${data.espId}`
          );
        }
      }

      // 压力容器（过滤器、汇管、工业管道）
      if (['6016', '7010', '7012'].includes(typeValue)) {
        const list = await getYLRQByScan(equipmentsyscode);
        const data = list.data.rows.find(item => item.equipmentsyscode === equipmentsyscode);
        if (data) {
          router.push(
            `/device/special-detail?dataId=${data.dataid}&typeValue=${typeValue}&equipmentcode=${data.equipmentcode}&equipment=${data.equipment}&equipmentsyscode=${data.equipmentsyscode}&espId=${data.espId}`
          );
        }
      }

      // 安全附件
      if (
        ['5011', '5017', '5019', '5015', '5016', '7004', '4702', '5018', '5030'].includes(typeValue)
      ) {
        const list = await getAQFJByScan(equipmentsyscode);
        const data = list.data.rows.find(item => item.equipmentsyscode === equipmentsyscode);
        if (data) {
          router.push(
            `/device/special-detail?dataId=${data.dataid}&typeValue=${typeValue}&equipmentcode=${data.equipmentcode}&equipment=${data.equipment}&equipmentsyscode=${data.equipmentsyscode}&espId=${data.espId}`
          );
        }
      }

      // 车辆
      if (typeValue === '6012') {
        const list = await getCLByScan(equipmentsyscode, typeValue);
        const data = list.data.rows.find(item => item.equipmentsyscode === equipmentsyscode);
        if (data) {
          router.push(
            `/device/material-detail?dataId=${data.dataid}&typeValue=${typeValue}&equipmentcode=${data.equipmentcode}&equipment=${data.equipment}&equipmentsyscode=${data.equipmentsyscode}&espId=${data.espId}`
          );
        }
      }

      // 救援物资
      if (typeValue === '5023') {
        const list = await getJYWZByScan(equipmentsyscode, typeValue);
        const data = list.data.rows.find(item => item.equipmentsyscode === equipmentsyscode);
        if (data) {
          router.push(
            `/device/material-detail?dataId=${data.dataid}&typeValue=${typeValue}&equipmentcode=${data.equipmentcode}&equipment=${data.equipment}&equipmentsyscode=${data.equipmentsyscode}&espId=${data.espId}`
          );
        }
      }

      // 备品备件
      if (typeValue === '7011') {
        const list = await getBPBJByScan(equipmentsyscode, typeValue);
        const data = list.data.rows.find(item => item.equipmentsyscode === equipmentsyscode);
        if (data) {
          router.push(
            `/device/material-detail?dataId=${data.dataid}&typeValue=${typeValue}&equipmentcode=${data.equipmentcode}&equipment=${data.equipment}&equipmentsyscode=${data.equipmentsyscode}&espId=${data.espId}`
          );
        }
      }

      // 其他
      if (typeValue === '5037') {
        const list = await getQTByScan(equipmentsyscode, typeValue);
        const data = list.data.rows.find(item => item.equipmentsyscode === equipmentsyscode);
        if (data) {
          router.push(
            `/device/material-detail?dataId=${data.dataid}&typeValue=${typeValue}&equipmentcode=${data.equipmentcode}&equipment=${data.equipment}&equipmentsyscode=${data.equipmentsyscode}&espId=${data.espId}`
          );
        }
      }

      // 消防设备
      if (typeValue === '5034') {
        const list = await getXFSBByScan(equipmentsyscode, typeValue);
        const data = list.data.rows.find(item => item.equipmentsyscode === equipmentsyscode);
        if (data) {
          router.push(
            `/device/fire-fighting-detail?dataId=${data.dataid}&typeValue=${typeValue}&equipmentcode=${data.equipmentcode}&equipment=${data.equipment}&equipmentsyscode=${data.equipmentsyscode}&espId=${data.espId}`
          );
        }
      }

      // 绝缘接头
      if (typeValue === '7008') {
        const list = await getJYJTByScan(equipmentsyscode, typeValue);
        const data = list.data.rows.find(item => item.equipmentsyscode === equipmentsyscode);
        if (data) {
          router.push(
            `/device/isolation-detail?dataId=${data.dataid}&typeValue=${typeValue}&equipmentcode=${data.equipmentcode}&equipment=${data.equipment}&equipmentsyscode=${data.equipmentsyscode}&espId=${data.espId}`
          );
        }
      }

      // 激光云台
      if (typeValue === '6015') {
        const list = await getJGYTByScan();
        const data = list.data.rows.find(item => item.equipmentsyscode === equipmentsyscode);
        if (data) {
          router.push(
            `/device/whole-set-detail?dataId=${data.id}&typeValue=${typeValue}&equipmentcode=${data.equipmentcode}&equipment=${data.equipment}&equipmentsyscode=${data.equipmentsyscode}&espId=${data.espId}`
          );
        }
      }
    }
  }

  return { handleScan };
}
