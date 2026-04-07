<template>
  <div class="wrapper">
    <div class="title">{{ main?.equipmentcode }}</div>
    <van-tabs
      v-model:active="active"
      title-active-color="#00B099"
      title-inactive-color="#84ABBB"
      :line-height="0"
    >
      <!-- 基本信息 -->
      <van-tab title="基本信息">
        <div
          class="edit-btn"
          v-if="canEditCondition && typeValue == '5001'"
          @click="
            $router.push({
              path: '/device/edit',
              query: {
                dataId,
                typeValue,
              },
            })
          "
        >
          修改
        </div>
        <!-- 紧急代码，后期修改 -->
        <!-- v-else-if="['5005', '5010', '6014', '6015'].includes(typeValue)" -->
        <!-- <div v-else style="height: 44px"></div> -->

        <div :class="canEditCondition && typeValue == '5001' ? 'content can-edit' : 'content'">
          <div class="content-list">
            <template v-for="(item, index) in dataList" :key="index">
              <ul>
                <div class="menu-title">{{ item.label }}</div>
                <template v-for="value in item.children" :key="value.label">
                  <li v-if="value.value" :class="value.key">
                    <div>{{ value.label }}：</div>
                    <div>{{ value.value }}</div>
                  </li>
                </template>
              </ul>
            </template>
          </div>
        </div>
      </van-tab>
      <!-- 巡检记录(只有调压箱、调压站、阀井) -->
      <van-tab v-if="['5005', '5001', '5010'].includes(typeValue)" title="巡检记录">
        <div class="edit-btn" v-if="canInspectCondition" @click="addInspect">新增</div>
        <div :class="canInspectCondition ? 'content can-edit' : 'content'">
          <div class="content-list">
            <template v-if="inspectList?.length" v-for="item in inspectList">
              <div
                class="repair-item"
                @click="
                  $router.push(
                    `/inspect/checking/${item.id}?type=${typeMap[typeValue]}&formType=show`
                  )
                "
              >
                <span v-if="item.patrolDate"
                  ><div class="title">巡检时间：</div>

                  <div class="cont">{{ item.patrolDate }}</div>
                </span>
                <span v-if="item.patrolPerson"
                  ><div class="title">巡检人：</div>

                  <div class="cont">{{ item.patrolPerson }}</div>
                </span>
                <span v-if="item.patrolStatus">
                  <div class="title">巡检状态：</div>

                  <div
                    class="cont"
                    v-html="
                      item.patrolStatus == '1'
                        ? '正常'
                        : item.patrolStatus == '2'
                          ? '<span style=color:#f00>异常</span>'
                          : '未巡检'
                    "
                  ></div>
                </span>
              </div>
            </template>
            <van-empty v-else description="暂无数据" />
          </div>
        </div>
      </van-tab>
      <!-- 维修记录 -->
      <van-tab title="维修记录">
        <div class="edit-btn" v-if="canEditCondition" @click="addRepair">新增</div>
        <div :class="canEditCondition ? 'content can-edit' : 'content'">
          <div class="content-list">
            <template
              v-if="main?.equipmentMaintains"
              v-for="item in Object.keys(main?.equipmentMaintains)"
            >
              <div class="repair-item" @click="viewRepairInfo(main?.equipmentMaintains[item])">
                <span v-if="item">
                  <div class="title">维修单号：</div>
                  <div class="cont">{{ item }}</div>
                </span>
                <!-- <span v-if="item.equipmentnum"
                  ><div class="title">设备编号：</div>

                  <div class="cont">{{ item.equipmentnum }}</div>
                </span> -->
                <span v-if="item">
                  <div class="title">设备名称：</div>
                  <div class="cont">
                    {{
                      main?.equipmentMaintains[item]
                        .map(v => v.equipmentname)
                        .toString()
                        .replaceAll(',', '、')
                    }}
                  </div>
                </span>
                <!-- <span v-if="item.content">
                  <div class="title">维修内容：</div>
                  <div class="cont">{{ item.content }}</div>
                </span> -->
                <span v-if="item">
                  <div class="title">维修人：</div>
                  <div class="cont">{{ main?.equipmentMaintains[item][0].operator }}</div>
                </span>
                <span v-if="item">
                  <div class="title">维修日期：</div>
                  <div class="cont">
                    {{ main?.equipmentMaintains[item][0].operationtime.split(' ')[0] }}
                  </div>
                </span>
              </div>
            </template>
            <van-empty v-else description="暂无数据" />
          </div>
        </div>
      </van-tab>
      <!-- 保养记录 -->
      <van-tab title="保养记录">
        <div class="edit-btn" v-if="canEditCondition" @click="addHealth">新增</div>
        <!-- 只有调压箱和调压站有临时和定期保养，阀井有确定表单保养，其他都是一般保养 -->
        <template v-if="['5005', '5001'].includes(typeValue)">
          <van-tabs
            v-model:active="healthRecord"
            title-active-color="#00B099"
            title-inactive-color="#84ABBB"
            :class="canEditCondition ? 'health can-edit' : 'health'"
            :line-height="0"
            @change="healthTabChange"
          >
            <van-tab title="临时保养" name="temp">
              <div class="content">
                <div class="content-list">
                  <template
                    v-if="main?.equipmentUpKeeps.filter(i => i.upkeeptype === '0').length"
                    v-for="item in main?.equipmentUpKeeps.filter(i => i.upkeeptype === '0')"
                  >
                    <div class="repair-item" @click="viewInfo(item)">
                      <span v-if="item.oddnumbers">
                        <div class="title">保养单号：</div>
                        <div class="cont">{{ item.oddnumbers }}</div>
                      </span>
                      <span v-if="item.equipmentnum">
                        <div class="title">设备编号：</div>
                        <div class="cont">{{ item.equipmentnum }}</div>
                      </span>
                      <span v-if="item.content">
                        <div class="title">保养项：</div>
                        <div class="cont cont-desc">
                          <template v-for="(item, i) in JSON.parse(item.content)" :key="i"
                            >{{ item.equipmentname }}、</template
                          >
                        </div>
                      </span>
                      <span v-if="item.upkeeplefttime">
                        <div class="title">剩余时间：</div>
                        <div class="cont">{{ item.upkeeplefttime }}</div>
                      </span>
                      <span v-if="item.operator">
                        <div class="title">保养人：</div>
                        <div class="cont">{{ item.operator }}</div>
                      </span>
                      <span v-if="item.nextupkeeptime">
                        <div class="title">保养日期：</div>
                        <div class="cont">{{ item.nextupkeeptime }}</div>
                      </span>
                    </div>
                  </template>
                  <van-empty v-else description="暂无数据" />
                </div>
              </div>
            </van-tab>
            <van-tab title="定期保养" name="dingQi">
              <van-tabs
                v-model:active="dingQiGrade"
                title-active-color="#00B099"
                title-inactive-color="#84ABBB"
                :line-height="0"
                @change="healthTabChange"
              >
                <van-tab title="一级" name="one">
                  <div class="content">
                    <div class="content-list">
                      <template
                        v-if="main?.equipmentUpKeeps.filter(i => i.upkeeptype === '1').length"
                        v-for="item in main?.equipmentUpKeeps.filter(i => i.upkeeptype === '1')"
                      >
                        <div class="repair-item" @click="viewInfo(item)">
                          <span v-if="item.oddnumbers">
                            <div class="title">保养单号：</div>
                            <div class="cont">{{ item.oddnumbers }}</div>
                          </span>
                          <span v-if="item.equipmentnum">
                            <div class="title">设备编号：</div>
                            <div class="cont">{{ item.equipmentnum }}</div>
                          </span>
                          <span v-if="item.content">
                            <div class="title">保养项：</div>
                            <div class="cont cont-desc">
                              <template v-for="(item, i) in JSON.parse(item.content)" :key="i"
                                >{{ item.label }}、</template
                              >
                            </div>
                          </span>
                          <span v-if="item.upkeeplefttime">
                            <div class="title">剩余时间：</div>
                            <div class="cont">{{ item.upkeeplefttime }}</div>
                          </span>
                          <span v-if="item.operator">
                            <div class="title">保养人：</div>
                            <div class="cont">{{ item.operator }}</div>
                          </span>
                          <span v-if="item.nextupkeeptime">
                            <div class="title">保养日期：</div>
                            <div class="cont">{{ item.nextupkeeptime }}</div>
                          </span>
                        </div>
                      </template>
                      <van-empty v-else description="暂无数据" />
                    </div>
                  </div>
                </van-tab>
                <van-tab title="三级" name="three">
                  <div class="content">
                    <div class="content-list">
                      <template
                        v-if="main?.equipmentUpKeeps.filter(i => i.upkeeptype === '3').length"
                        v-for="item in main?.equipmentUpKeeps.filter(i => i.upkeeptype === '3')"
                      >
                        <div class="repair-item" @click="viewInfo(item)">
                          <span v-if="item.oddnumbers">
                            <div class="title">保养单号：</div>
                            <div class="cont">{{ item.oddnumbers }}</div>
                          </span>
                          <span v-if="item.equipmentnum">
                            <div class="title">设备编号：</div>
                            <div class="cont">{{ item.equipmentnum }}</div>
                          </span>
                          <span v-if="item.content">
                            <div class="title">保养项：</div>
                            <div class="cont cont-desc">
                              <template v-for="(item, i) in JSON.parse(item.content)" :key="i"
                                >{{ item.label }}、</template
                              >
                            </div>
                          </span>
                          <span v-if="item.upkeeplefttime">
                            <div class="title">剩余时间：</div>
                            <div class="cont">{{ item.upkeeplefttime }}</div>
                          </span>
                          <span v-if="item.operator">
                            <div class="title">保养人：</div>
                            <div class="cont">{{ item.operator }}</div>
                          </span>
                          <span v-if="item.nextupkeeptime">
                            <div class="title">保养日期：</div>
                            <div class="cont">{{ item.nextupkeeptime }}</div>
                          </span>
                        </div>
                      </template>
                      <van-empty v-else description="暂无数据" />
                    </div>
                  </div>
                </van-tab>
              </van-tabs>
            </van-tab>
          </van-tabs>
        </template>
        <!-- 阀井的临时和定期保养 -->
        <template v-else-if="['5010'].includes(typeValue)">
          <van-tabs
            v-model:active="healthRecord"
            title-active-color="#00B099"
            title-inactive-color="#84ABBB"
            :class="canEditCondition ? 'health can-edit' : 'health'"
            :line-height="0"
            @change="healthTabChange"
          >
            <van-tab title="临时保养" name="temp">
              <div class="content">
                <div class="content-list">
                  <template
                    v-if="main?.equipmentUpKeeps.filter(i => i.upkeeptype === '0').length"
                    v-for="item in main?.equipmentUpKeeps.filter(i => i.upkeeptype === '0')"
                  >
                    <div class="repair-item" @click="viewInfo(item)">
                      <span v-if="item.oddnumbers">
                        <div class="title">保养单号：</div>
                        <div class="cont">{{ item.oddnumbers }}</div>
                      </span>
                      <span v-if="item.equipmentnum">
                        <div class="title">设备编号：</div>
                        <div class="cont">{{ item.equipmentnum }}</div>
                      </span>
                      <span v-if="item.content">
                        <div class="title">保养项：</div>
                        <div class="cont cont-desc">
                          <template v-for="(item, i) in JSON.parse(item.content)" :key="i"
                            >{{ item.equipmentname }}、</template
                          >
                        </div>
                      </span>
                      <span v-if="item.upkeeplefttime">
                        <div class="title">剩余时间：</div>
                        <div class="cont">{{ item.upkeeplefttime }}</div>
                      </span>
                      <span v-if="item.operator">
                        <div class="title">保养人：</div>
                        <div class="cont">{{ item.operator }}</div>
                      </span>
                      <span v-if="item.nextupkeeptime">
                        <div class="title">保养日期：</div>
                        <div class="cont">{{ item.nextupkeeptime }}</div>
                      </span>
                    </div>
                  </template>
                  <van-empty v-else description="暂无数据" />
                </div>
              </div>
            </van-tab>
            <van-tab title="定期保养" name="dingQi">
              <div class="content">
                <div class="content-list">
                  <template
                    v-if="main?.equipmentUpKeeps.filter(i => i.upkeeptype === '2').length"
                    v-for="item in main?.equipmentUpKeeps.filter(i => i.upkeeptype === '2')"
                  >
                    <div class="repair-item" @click="viewInfo(item)">
                      <span v-if="item.oddnumbers">
                        <div class="title">保养单号：</div>
                        <div class="cont">{{ item.oddnumbers }}</div>
                      </span>
                      <span v-if="item.equipmentnum">
                        <div class="title">设备编号：</div>
                        <div class="cont">{{ item.equipmentnum }}</div>
                      </span>
                      <span v-if="item.content">
                        <div class="title">保养项：</div>
                        <div class="cont cont-desc">
                          <template v-for="(item, i) in JSON.parse(item.content)" :key="i"
                            >{{ item.label }}、</template
                          >
                        </div>
                      </span>
                      <span v-if="item.upkeeplefttime">
                        <div class="title">剩余时间：</div>
                        <div class="cont">{{ item.upkeeplefttime }}</div>
                      </span>
                      <span v-if="item.operator">
                        <div class="title">保养人：</div>
                        <div class="cont">{{ item.operator }}</div>
                      </span>
                      <span v-if="item.nextupkeeptime">
                        <div class="title">保养日期：</div>
                        <div class="cont">{{ item.nextupkeeptime }}</div>
                      </span>
                    </div>
                  </template>
                  <van-empty v-else description="暂无数据" />
                </div>
              </div>
            </van-tab>
          </van-tabs>
        </template>
        <template v-else>
          <div :class="canEditCondition ? 'content can-edit' : 'content'">
            <div class="content-list">
              <template
                v-if="main?.equipmentUpKeeps?.filter(i => i.upkeeptype === '0').length"
                v-for="item in main?.equipmentUpKeeps.filter(i => i.upkeeptype === '0')"
              >
                <div class="repair-item" @click="viewInfo(item)">
                  <span v-if="item.oddnumbers">
                    <div class="title">保养单号：</div>
                    <div class="cont">{{ item.oddnumbers }}</div>
                  </span>
                  <span v-if="item.equipmentnum">
                    <div class="title">设备编号：</div>
                    <div class="cont">
                      {{
                        item.equipmentnum !== 'undefined'
                          ? item.equipmentnum
                          : item.equipmentsyscode
                      }}
                    </div>
                  </span>
                  <span v-if="item.content">
                    <div class="title">保养项：</div>
                    <div class="cont cont-desc">
                      <template v-for="(item, i) in JSON.parse(item.content)" :key="i"
                        >{{ item.equipmentname }}、</template
                      >
                    </div>
                  </span>
                  <span v-if="item.upkeeplefttime">
                    <div class="title">剩余时间：</div>
                    <div class="cont">{{ item.upkeeplefttime }}</div>
                  </span>
                  <span v-if="item.operator">
                    <div class="title">保养人：</div>
                    <div class="cont">{{ item.operator }}</div>
                  </span>
                  <span v-if="item.nextupkeeptime">
                    <div class="title">保养日期：</div>
                    <div class="cont">{{ item.nextupkeeptime }}</div>
                  </span>
                </div>
              </template>
              <van-empty v-else description="暂无数据" />
            </div>
          </div>
        </template>
      </van-tab>

      <!-- 楼栋关系（只有调压箱） -->
      <van-tab v-if="typeValue === '5001'" title="楼栋关系">
        <div class="edit-btn" v-if="canEditCondition" @click="addBuilding">新增</div>

        <div :class="canEditCondition ? 'content can-edit' : 'content'">
          <!-- <div :class="'content'"> -->
          <div class="content-list building-list">
            <template v-if="buildingRelation?.length" v-for="item in buildingRelation">
              <div
                class="building-wrapper"
                @click="$router.push(`/device/building-detail?buildingid=${item.buildingid}`)"
              >
                <div class="name">
                  {{ `${item.county}${item.community}${item.name}` }}
                </div>
                <van-icon name="arrow" color="#17617e" />
              </div>
            </template>
            <van-empty v-else description="暂无数据" />
          </div>
        </div>
      </van-tab>
      <!-- 气密性试验（只有调压箱） -->
      <van-tab v-if="typeValue === '5001'" title="气密性试验">
        <div class="edit-btn" v-if="canEditCondition" @click="addPicture">添加照片</div>

        <div :class="canEditCondition ? 'content can-edit' : 'content'">
          <div class="content-list pic-list">
            <template v-if="airPicture.length" v-for="item in airPicture">
              <div class="pic-wrapper">
                <div class="name">
                  {{ item.type === 0 ? '调压箱编号' : '气密试验手持压力表' }}
                </div>
                <img
                  v-long-press="() => deletePic(item.id)"
                  :src="`${config.fileUrl}${item.fileUrl}`"
                  alt=""
                />
              </div>
            </template>
            <van-empty v-else description="暂无数据" />
          </div>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import {
  getTYZDetailByDataId,
  getYBZDetailByDataId,
  getTYQDetailByDataId,
  getFMJDetailByDataId,
  getJCSBDetailByDataId,
  getTYXInspectInfoByCode,
  getFMJInspectInfoByCode,
  getTYZInspectInfoByCode,
  getFilePic,
  delFilePic,
  getJGYTDetailByDataId,
  getJGYTList,
  getRepairList,
  getHealthList,
  getBuildingRelation,
} from '../../../../api/device';
import { api_regulator, api_well } from '../../../../api/inspect.js';
import { getValue } from '../../hooks/useDict';
import { canEditDevice } from '@/utils/user-permission';
import dayjs from 'dayjs';
import { showToast, showConfirmDialog } from 'vant';
import useUserStore from '../../../../stores/user';
// import { useMyRouter } from '@/hooks/use-my-router';
import config from '@/config';
import { createLoading } from '../../../../utils/loading-fn';
import service from '../../../../utils/service';
import { useAliveTab } from '@/hooks/use-alive.js';
import { baseBuildingNetOrganizationListAll } from '@/api/device';
import { useMainDataStore } from '@/stores/inspect/main-data';

const useMainData = useMainDataStore();

const route = useRoute();
const router = useRouter();

const active = ref(0);

useAliveTab(active);

const typeMap = {
  5005: 'station',
  5001: 'regulator',
  5010: 'well',
};

const dataId = route.query.dataId;
const typeValue = route.query.typeValue;
const equipmentcode = route.query.equipmentcode;
const equipment = route.query.equipment;
const equipmentsyscode = route.query.equipmentsyscode;

// const canEditCondition = typeValue == 5001 && canEditDevice();
const canEditCondition =
  ['5001', '5005', '5010', '6014', '6015'].includes(typeValue) && canEditDevice();

// 基础数据
const main = ref(null);

// 巡检历史记录
const inspectList = ref(null);

// 调压箱楼栋关系
const buildingRelation = ref(null);

const dataList = computed(() => {
  let value;
  switch (typeValue) {
    case '5005':
      value = [
        {
          label: '场站介绍',
          children: [
            {
              key: 'remarks',
              label: '',
              value: main.value?.remarks,
            },
          ],
        },
        {
          label: '本体信息',
          children: [
            // {
            //   key: 'aaaaaaaa',
            //   label: '站场编码',
            //   value: main.value?.equipmentcode,
            // },
            {
              key: 'aaaaaaaa',
              label: '站场名称',
              value: main.value?.equipment,
            },
            {
              key: 'aaaaaaaa',
              label: '站场尺寸(m*m)',
              value: main.value?.widths,
            },
            {
              key: 'aaaaaaaa',
              label: '所在位置',
              value: main.value?.address,
            },
            {
              key: 'aaaaaaaa',
              label: '站场状态',
              value: getValue(main.value?.status, 7),
            },
            {
              key: 'aaaaaaaa',
              label: '供气区域',
              value: main.value?.stationhead,
            },
            {
              key: 'aaaaaaaa',
              label: '型号',
              value: main.value?.specmodel,
            },
            {
              key: 'aaaaaaaa',
              label: '进口压力',
              value: main.value?.inputpressure,
            },
            {
              key: 'aaaaaaaa',
              label: '出口压力',
              value: main.value?.outputpressure,
            },
            {
              key: 'aaaaaaaa',
              label: '流量',
              value: main.value?.flow,
            },
            {
              key: 'aaaaaaaa',
              label: '温度',
              value: main.value?.temperature,
            },
            {
              key: 'aaaaaaaa',
              label: '介质',
              value: getValue(main.value?.medium, 48),
            },
            {
              key: 'aaaaaaaa',
              label: '重量',
              value: main.value?.weight,
            },
            {
              key: 'aaaaaaaa',
              label: '生产厂家',
              value: main.value?.manufacturer,
            },
            {
              key: 'aaaaaaaa',
              label: '出厂日期',
              value: main.value?.outfactorydate,
            },
            {
              key: 'aaaaaaaa',
              label: '许可证编号',
              value: main.value?.license,
            },
            {
              key: 'aaaaaaaa',
              label: '厂家地址',
              value: main.value?.manufactureraddress,
            },
            {
              key: 'aaaaaaaa',
              label: '厂家网址',
              value: main.value?.manufacturerurl,
            },
            {
              key: 'aaaaaaaa',
              label: '厂家电话',
              value: main.value?.manufacturertel,
            },
            {
              key: 'aaaaaaaa',
              label: 'No',
              value: main.value?.number,
            },
          ],
        },
        {
          label: '附属信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '输配量(万m³/h)',
              value: main.value?.distributionquantity,
            },
            {
              key: 'aaaaaaaa',
              label: '建站日期',
              value: main.value?.buliddate,
            },
            {
              key: 'aaaaaaaa',
              label: '竣工日期',
              value: main.value?.completiondate,
            },
            {
              key: 'aaaaaaaa',
              label: '投产日期',
              value: main.value?.inusedate,
            },
          ],
        },
        {
          label: '管理信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '权属单位',
              value: getValue(main.value?.ownership, 16),
            },
            {
              key: 'aaaaaaaa',
              label: '管理负责人',
              value: main.value?.manageuser,
            },
            {
              key: 'aaaaaaaa',
              label: '负责人电话',
              value: main.value?.phone,
            },
            {
              key: 'aaaaaaaa',
              label: '场站值守',
              value: getValue(main.value?.stationwatch, 17),
            },
            {
              key: 'aaaaaaaa',
              label: '管理班组',
              value: main.value?.managementteam,
            },
            {
              key: 'aaaaaaaa',
              label: '所在线路',
              value: main.value?.localline,
            },
            {
              key: 'aaaaaaaa',
              label: '是否有阴保',
              value: getValue(main.value?.protection, 18),
            },
            {
              key: 'aaaaaaaa',
              label: '所属路段',
              value: main.value?.roadsection,
            },
          ],
        },
        {
          label: '工艺参数',
          children: [
            // {
            //   key: 'aaaaaaaa',
            //   label: '是否放空',
            //   value: getValue(main.value?.evacuation, 19),
            // },
            // {
            //   key: 'aaaaaaaa',
            //   label: '是否切断',
            //   value: getValue(main.value?.breaks, 20),
            // },
            {
              key: 'aaaaaaaa',
              label: '设计压力(Mpa)',
              value: main.value?.designpressure,
            },
            {
              key: 'aaaaaaaa',
              label: '征地面积(㎡)',
              value: main.value?.floorspace,
            },
          ],
        },
      ];
      break;

    case '6011':
      value = [
        {
          label: '本体信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '阴保站名称',
              value: main.value?.equipment,
            },
            // {
            //   key: 'aaaaaaaa',
            //   label: '阴保站编号',
            //   value: main.value?.equipmentcode,
            // },
            {
              key: 'aaaaaaaa',
              label: '材质',
              value: getValue(main.value?.material, 21),
            },
            {
              key: 'aaaaaaaa',
              label: '型号',
              value: main.value?.model,
            },
            {
              key: 'aaaaaaaa',
              label: '尺寸(m*m)',
              value: main.value?.size,
            },
            {
              key: 'aaaaaaaa',
              label: '重量',
              value: main.value?.height,
            },
            {
              key: 'aaaaaaaa',
              label: '运行状态',
              value: getValue(main.value?.status, 7),
            },
            {
              key: 'aaaaaaaa',
              label: '核心参数',
              value: main.value?.coreParam,
            },
            {
              key: 'aaaaaaaa',
              label: '用途',
              value: main.value?.purpose,
            },
          ],
        },
        {
          label: '附属信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '安装位置',
              value: main.value?.installationPosition,
            },
            {
              key: 'aaaaaaaa',
              label: '生产单位',
              value: main.value?.productionUnit,
            },
            {
              key: 'aaaaaaaa',
              label: '生产日期',
              value: main.value?.productionDate,
            },
            {
              key: 'aaaaaaaa',
              label: '出厂产品编号',
              value: main.value?.productionNum,
            },
            {
              key: 'aaaaaaaa',
              label: '厂家联系电话',
              value: main.value?.productionPhone,
            },
            {
              key: 'aaaaaaaa',
              label: '启用日期',
              value: main.value?.startDate,
            },
          ],
        },
        {
          label: '管理信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '用电方式',
              value: getValue(main.value?.electricityMethod, 22),
            },
            {
              key: 'aaaaaaaa',
              label: '电价(元)',
              value: main.value?.electricityPrice,
            },
            {
              key: 'aaaaaaaa',
              label: '供电单位',
              value: main.value?.electricityUnit,
            },
            {
              key: 'aaaaaaaa',
              label: '协议有效期(年)',
              value: main.value?.protocolValidity,
            },
            {
              key: 'aaaaaaaa',
              label: '管理单位',
              value: getValue(main.value?.managementUnit, 16),
            },
            {
              key: 'aaaaaaaa',
              label: '联系人电话',
              value: main.value?.telephone,
            },
            {
              key: 'aaaaaaaa',
              label: '备注',
              value: main.value?.remarks,
            },
          ],
        },
        {
          label: '关联信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '恒电位仪',
              value: main.value?.potentiostat,
            },
            {
              key: 'aaaaaaaa',
              label: '管线编号',
              value: main.value?.lineCode,
            },
          ],
        },
        {
          label: '空间信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '所属区域',
              value: getValue(main.value?.belongRegion, 11),
            },
            {
              key: 'aaaaaaaa',
              label: '所属路段',
              value: main.value?.belongRoad,
            },
            {
              key: 'aaaaaaaa',
              label: 'X坐标',
              value: main.value?.xcoordinate,
            },
            {
              key: 'aaaaaaaa',
              label: 'Y坐标',
              value: main.value?.ycoordinate,
            },
            {
              key: 'aaaaaaaa',
              label: '高程(m)',
              value: main.value?.elevation,
            },
          ],
        },
      ];
      break;

    case '5001':
      value = [
        {
          label: '本体信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '调压箱(柜)类型',
              value: getValue(main.value?.compressorboxtype, 23),
            },
            // {
            //   key: 'aaaaaaaa',
            //   label: '调压箱(柜)编号',
            //   value: main.value?.equipmentcode,
            // },
            {
              key: 'aaaaaaaa',
              label: '调压箱(柜)型号',
              value: main.value?.compressorboxlmodel,
            },
            {
              key: 'aaaaaaaa',
              label: '调压箱(柜)材质',
              value: getValue(main.value?.compressorboxmaterial, 24),
            },
            {
              key: 'aaaaaaaa',
              label: '调压箱(柜)结构',
              value: getValue(main.value?.configurationtype, 25),
            },
            {
              key: 'aaaaaaaa',
              label: '用气性质',
              value: getValue(main.value?.propertyofuse, 26),
            },
            {
              key: 'aaaaaaaa',
              label: '调压箱(柜)分级',
              value: getValue(main.value?.compressorboxgrade, 27),
            },
            {
              key: 'aaaaaaaa',
              label: '设计流量(m³/h)',
              value: main.value?.flowdesign,
            },
            {
              key: 'aaaaaaaa',
              label: '设计进口压力(Mpa)',
              value: main.value?.desiginletfressure,
            },
            {
              key: 'aaaaaaaa',
              label: '设计出口压力(Mpa)',
              value: main.value?.desienlutletpressure,
            },
            {
              key: 'aaaaaaaa',
              label: '最大进口压力(Mpa)',
              value: main.value?.maxinletpressure,
            },
            {
              key: 'aaaaaaaa',
              label: '最大出口压力(Mpa)',
              value: main.value?.maxoutletpressure,
            },
            {
              key: 'aaaaaaaa',
              label: '进口管径(mm)',
              value: main.value?.inletdiameter,
            },
            {
              key: 'aaaaaaaa',
              label: '出口管径(mm)',
              value: main.value?.outletdiameter,
            },
            {
              key: 'aaaaaaaa',
              label: '放散设计压力(Mpa)',
              value: main.value?.releasepressure,
            },
            {
              key: 'aaaaaaaa',
              label: '切断设计压力(Mpa)',
              value: main.value?.cutoffpressuredesign,
            },
            {
              key: 'aaaaaaaa',
              label: '调压箱(柜)头类型',
              value: main.value?.regulatorheadid,
            },
            {
              key: 'aaaaaaaa',
              label: '调压箱(柜)头产地',
              value: getValue(main.value?.froducertype, 28),
            },
            {
              key: 'aaaaaaaa',
              label: '过滤器类型',
              value: main.value?.filtermodel,
            },
            {
              key: 'aaaaaaaa',
              label: '过滤器产地',
              value: getValue(main.value?.filterorigin, 28),
            },
            {
              key: 'aaaaaaaa',
              label: '调压箱(柜)重量(Kg)',
              value: main.value?.weight,
            },
            {
              key: 'aaaaaaaa',
              label: '生产厂家',
              value: main.value?.manufacturer,
            },
            {
              key: 'aaaaaaaa',
              label: '生产日期',
              value: main.value?.manufactureddate,
            },
            {
              key: 'aaaaaaaa',
              label: '调压箱(柜)状态',
              value: getValue(main.value?.status, 7),
            },
            {
              key: 'aaaaaaaa',
              label: '最后修改人',
              value: main.value?.updateby || main.value?.createby,
            },
            {
              key: 'aaaaaaaa',
              label: '最后修改时间',
              value: main.value?.updatetime || main.value?.createtime,
            },
          ],
        },
        {
          label: '附属信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '有无放散管',
              value: getValue(main.value?.releasepipeindid, 29),
            },
            {
              key: 'aaaaaaaa',
              label: '切断阀型号',
              value: main.value?.cutoffid,
            },
            {
              key: 'aaaaaaaa',
              label: '中压压力表',
              value: main.value?.mediumfressuregauge,
            },
            {
              key: 'aaaaaaaa',
              label: '低压压力表',
              value: main.value?.lowpressuregauge,
            },
            {
              key: 'aaaaaaaa',
              label: '压力表是否首检',
              value: getValue(main.value?.firstinspectionind, 30),
            },
            {
              key: 'aaaaaaaa',
              label: '是否有静电跨接',
              value: getValue(main.value?.electrostaticbridgingind, 31),
            },
            {
              key: 'aaaaaaaa',
              label: '静电跨接数量',
              value: main.value?.elecbridginghum,
            },
            {
              key: 'aaaaaaaa',
              label: '是否有护栏',
              value: getValue(main.value?.guardrailind, 32),
            },
            {
              key: 'aaaaaaaa',
              label: '护栏尺寸(m*m)',
              value: main.value?.compressorboxsize,
            },
            {
              key: 'aaaaaaaa',
              label: '是否有警示牌',
              value: getValue(main.value?.warningsignind, 33),
            },
            {
              key: 'aaaaaaaa',
              label: '小区架空管(m)',
              value: main.value?.overheadpipeshum,
            },
            {
              key: 'aaaaaaaa',
              label: '小区引入管(m)',
              value: main.value?.inletpipesnum,
            },
            {
              key: 'aaaaaaaa',
              label: '是否有测试线',
              value: getValue(main.value?.testlineind, 18),
            },
            {
              key: 'aaaaaaaa',
              label: '绝缘接头位置',
              value: main.value?.insulatedjointlocation,
            },
            {
              key: 'aaaaaaaa',
              label: '离地高度',
              value: main.value?.rideheight,
            },
            {
              key: 'aaaaaaaa',
              label: '数据传输模式',
              value: getValue(main.value?.datatransmissionmode, 34),
            },
            {
              key: 'aaaaaaaa',
              label: '点位标签',
              value: main.value?.dvsn,
            },
          ],
        },
        {
          label: '管理信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '安装位置',
              value: main.value?.compressorboxlocation,
            },
            {
              key: 'aaaaaaaa',
              label: '安装方式',
              value: getValue(main.value?.methodburied, 35),
            },
            // {
            //   key: 'aaaaaaaa',
            //   label: '区域分组',
            //   value: main.value?.regionid
            // },
            {
              key: 'aaaaaaaa',
              label: '所在路段',
              value: main.value?.compressorboxroad,
            },
            {
              key: 'aaaaaaaa',
              label: '街道',
              value: main.value?.street,
            },
            {
              key: 'aaaaaaaa',
              label: '社区',
              value: main.value?.community,
            },
            {
              key: 'aaaaaaaa',
              label: '小区联系人',
              value: main.value?.contacts,
            },
            {
              key: 'aaaaaaaa',
              label: '联系人电话',
              value: main.value?.contactpersontel,
            },
            {
              key: 'aaaaaaaa',
              label: '管理区域',
              value: getValue(main.value?.subsystemname, 11),
            },
            {
              key: 'aaaaaaaa',
              label: '管理班组',
              value: getValue(main.value?.workteam, 12),
            },
            {
              key: 'aaaaaaaa',
              label: '投运日期',
              value: main.value?.efectivefromdate,
            },
            {
              key: 'aaaaaaaa',
              label: 'X坐标',
              value: main.value?.x,
            },
            {
              key: 'aaaaaaaa',
              label: 'Y坐标',
              value: main.value?.y,
            },
            {
              key: 'aaaaaaaa',
              label: '高程(m)',
              value: main.value?.elevation,
            },
            {
              key: 'aaaaaaaa',
              label: '设计单位',
              value: getValue(main.value?.designcompany, 9),
            },
            {
              key: 'aaaaaaaa',
              label: '施工单位',
              value: getValue(main.value?.assemblycompany, 5),
            },
            {
              key: 'aaaaaaaa',
              label: '监理单位',
              value: getValue(main.value?.inspectingcompany, 36),
            },
            {
              key: 'aaaaaaaa',
              label: '所属管线',
              value: main.value?.linecode,
            },
            {
              key: 'aaaaaaaa',
              label: '三维模型类型',
              value: getValue(main.value?.boxmodeltype, 37),
            },
          ],
        },
        {
          label: '工艺参数',
          children: [
            {
              key: 'aaaaaaaa',
              label: '放散实际压力(Mpa)',
              value: main.value?.releaseactualpressure,
            },
            {
              key: 'aaaaaaaa',
              label: '切断实际压力(Mpa)',
              value: main.value?.cutactualpressure,
            },
            {
              key: 'aaaaaaaa',
              label: '调压箱(柜)放散压力(Mpa)',
              value: main.value?.tybreleaseactualpressure,
            },
            {
              key: 'aaaaaaaa',
              label: '实际入口压力(Mpa)',
              value: main.value?.actualinletpressure,
            },
            {
              key: 'aaaaaaaa',
              label: '实际出口压力(Mpa)',
              value: main.value?.actualouterpressure,
            },
            {
              key: 'aaaaaaaa',
              label: '最低入口报警压力(Mpa)',
              value: main.value?.mininletalarmpressure,
            },
            {
              key: 'aaaaaaaa',
              label: '最低出口报警压力(Mpa)',
              value: main.value?.minouteralarmpressure,
            },
            {
              key: 'aaaaaaaa',
              label: '最高出口报警压力(Mpa)',
              value: main.value?.maxouteralarmpressure,
            },
            {
              key: 'aaaaaaaa',
              label: '传感器电压最低(%)',
              value: main.value?.lowestsensorvoltage,
            },
            {
              key: 'aaaaaaaa',
              label: '传感器电压报警(%)',
              value: main.value?.sensorvoltagealarm,
            },
          ],
        },
        // {
        //   label: '管控关系',
        //   children: [
        //     {
        //       key: 'aaaaaaaa',
        //       label: '所属路段',
        //       value: main.value?.belongRoad
        //     },
        // }
      ];
      break;

    case '5010':
      value = [
        {
          label: '本体信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '阀井类型',
              value: getValue(main.value?.valvewelltype, 40),
            },
            {
              key: 'aaaaaaaa',
              label: '阀井形状',
              value: getValue(main.value?.valvewellshape, 41),
            },
            {
              key: 'aaaaaaaa',
              label: '井盖规格(mm)',
              value: main.value?.welltype,
            },
            {
              key: 'aaaaaaaa',
              label: '井盖材质',
              value: getValue(main.value?.wellmaterial, 57),
            },
            {
              key: 'aaaaaaaa',
              label: '井体结构',
              value: getValue(main.value?.valvewellstructure, 42),
            },
            {
              key: 'aaaaaaaa',
              label: '井室尺寸',
              value: main.value?.wellchambersize,
            },
            // {
            //   key: 'aaaaaaaa',
            //   label: '井室深(m)',
            //   value: main.value?.wellchamberdepth,
            // },
            {
              key: 'aaaaaaaa',
              label: '阀门类型',
              value: main.value?.fmlx,
            },
            // {
            //   key: 'aaaaaaaa',
            //   label: '压力等级(MPa)',
            //   value: main.value?.yldj,
            // },
            {
              key: 'aaaaaaaa',
              label: '阀门生产厂家',
              value: main.value?.constructionunit,
            },
            {
              key: 'aaaaaaaa',
              label: '阀门安装日期',
              value: main.value?.fmazri,
            },
            {
              key: 'aaaaaaaa',
              label: '阀门规格',
              value: main.value?.fmgg,
            },
            {
              key: 'aaaaaaaa',
              label: '阀门长度(mm)',
              value: main.value?.fmcd,
            },
            {
              key: 'aaaaaaaa',
              label: '阀井深度(m)',
              value: main.value?.welldepth,
            },
            {
              key: 'aaaaaaaa',
              label: '支墩数量',
              value: main.value?.pillarnum,
            },
            // {
            //   key: 'aaaaaaaa',
            //   label: '有效起始期',
            //   value: main.value?.effectivestartdate,
            // },
            // {
            //   key: 'aaaaaaaa',
            //   label: '失效日期',
            //   value: main.value?.effectiveenddate,
            // },
          ],
        },
        {
          label: '附属信息',
          children: [
            // {
            //   key: 'aaaaaaaa',
            //   label: '设计单位',
            //   value: main.value?.designunit,
            // },
            // {
            //   key: 'aaaaaaaa',
            //   label: '施工单位',
            //   value: main.value?.constructionunit,
            // },
            // {
            //   key: 'aaaaaaaa',
            //   label: '监理单位',
            //   value: main.value?.controlunit,
            // },
            {
              key: 'aaaaaaaa',
              label: '位置描述',
              value: main.value?.localtion,
            },
          ],
        },
        {
          label: '管理信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '所在路段',
              value: main.value?.roadname,
            },
            {
              key: 'aaaaaaaa',
              label: '阀井位置',
              value: main.value?.localtion,
            },
            {
              key: 'aaaaaaaa',
              label: '阀井编号',
              value: main.value?.equipmentcode,
            },
            {
              key: 'aaaaaaaa',
              label: '阀井状态',
              value: getValue(main.value?.belongunit, 7),
            },
            {
              key: 'aaaaaaaa',
              label: '所属单位',
              value: getValue(main.value?.belongunit, 16),
            },
            {
              key: 'aaaaaaaa',
              label: '所属管线',
              value: main.value?.pipeline,
            },
            {
              key: 'aaaaaaaa',
              label: '区域分组',
              value: getAreaGroup(main.value?.regionid),
            },
            {
              key: 'aaaaaaaa',
              label: '管控关系',
              value: main.value?.controlrelationship,
            },
          ],
        },
        {
          label: '关联信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '阀门状态',
              value: getValue(main.value?.valvestatus, 39),
            },
            {
              key: 'aaaaaaaa',
              label: '阀门启用日期',
              value: main.value?.valvestartdate,
            },
            {
              key: 'aaaaaaaa',
              label: '补偿器厂家',
              value: main.value?.compensator,
            },
            {
              key: 'aaaaaaaa',
              label: '补偿器数量(个)',
              value: main.value?.compensatorripplenum,
            },
            {
              key: 'aaaaaaaa',
              label: '补偿器长度(mm)',
              value: main.value?.accessoriesstatus,
            },
            {
              key: 'aaaaaaaa',
              label: '是否有阴极保护',
              value: getValue(main.value?.cathodicprotectionstatus, 18),
            },
            {
              key: 'aaaaaaaa',
              label: '螺栓规格',
              value: main.value?.lsgg,
            },
            {
              key: 'aaaaaaaa',
              label: '螺栓数量(个)',
              value: main.value?.boltnum,
            },
            {
              key: 'aaaaaaaa',
              label: '放散生产厂家',
              value: main.value?.fssccj,
            },
            {
              key: 'aaaaaaaa',
              label: '放散阀门数量',
              value: getValue(main.value?.cathodicprotectionstatus, 58),
            },
            {
              key: 'aaaaaaaa',
              label: '放散规格',
              value: main.value?.releasevalvespecifications,
            },
            {
              key: 'aaaaaaaa',
              label: '是否有外部设备',
              value: getValue(main.value?.externalequipmentind, 18),
            },
            // {
            //   key: 'aaaaaaaa',
            //   label: '符号旋转方向',
            //   value: main.value?.symboldirection,
            // },
            // {
            //   key: 'aaaaaaaa',
            //   label: 'X坐标',
            //   value: main.value?.x,
            // },
            // {
            //   key: 'aaaaaaaa',
            //   label: 'Y坐标',
            //   value: main.value?.y,
            // },
            // {
            //   key: 'aaaaaaaa',
            //   label: '高程',
            //   value: main.value?.elevation,
            // },
          ],
        },
      ];
      break;

    case '6014':
      value = [
        {
          label: '本体信息',
          children: [
            // {
            //   key: 'aaaaaaaa',
            //   label: '设备编号',
            //   value: main.value?.equipmentcode,
            // },
            {
              key: 'aaaaaaaa',
              label: '设备型号',
              value: getValue(main.value?.pumpmode, 45),
            },
            {
              key: 'aaaaaaaa',
              label: '控制器型号',
              value: getValue(main.value?.controllertype, 46),
            },
            {
              key: 'aaaaaaaa',
              label: '防爆等级',
              value: getValue(main.value?.harardousrating, 47),
            },
            {
              key: 'aaaaaaaa',
              label: '设备状态',
              value: getValue(main.value?.status, 7),
            },
          ],
        },
        {
          label: '附属信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '点位数据',
              value: main.value?.dvsn,
            },
            {
              key: 'aaaaaaaa',
              label: '管线类型',
              value: getValue(main.value?.pipelinetype, 0),
            },
            {
              key: 'aaaaaaaa',
              label: '所属管线',
              value: main.value?.linecode,
            },
            {
              key: 'aaaaaaaa',
              label: '生产厂家',
              value: main.value?.manufacturer,
            },
            {
              key: 'aaaaaaaa',
              label: '生产日期',
              value: main.value?.manufactureddate,
            },
            {
              key: 'aaaaaaaa',
              label: '投运日期',
              value: main.value?.inuseworkdate,
            },
            {
              key: 'aaaaaaaa',
              label: '失效日期',
              value: main.value?.efectivetodate,
            },
          ],
        },
        {
          label: '管理信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '安装位置',
              value: main.value?.address,
            },
            {
              key: 'aaaaaaaa',
              label: '管理区域',
              value: getValue(main.value?.subsystemname, 11),
            },
            {
              key: 'aaaaaaaa',
              label: '管理班组',
              value: getValue(main.value?.workteam, 12),
            },
            {
              key: 'aaaaaaaa',
              label: '维保人员',
              value: main.value?.workers,
            },
            {
              key: 'aaaaaaaa',
              label: 'X坐标',
              value: main.value?.x,
            },
            {
              key: 'aaaaaaaa',
              label: 'Y坐标',
              value: main.value?.y,
            },
            {
              key: 'aaaaaaaa',
              label: '高程(m)',
              value: main.value?.z,
            },
            {
              key: 'aaaaaaaa',
              label: '设计单位',
              value: main.value?.designunit,
            },
            {
              key: 'aaaaaaaa',
              label: '施工单位',
              value: main.value?.assemblycompany,
            },
            {
              key: 'aaaaaaaa',
              label: '监理单位',
              value: main.value?.inspectingcompany,
            },
          ],
        },
        {
          label: '工艺参数',
          children: [
            {
              key: 'aaaaaaaa',
              label: '泵功率(W)',
              value: main.value?.pumpingpower,
            },
            {
              key: 'aaaaaaaa',
              label: '电压',
              value: getValue(main.value?.voltage, 44),
            },
            {
              key: 'aaaaaaaa',
              label: '天然气流量(m³/h)',
              value: main.value?.gasflow,
            },
            {
              key: 'aaaaaaaa',
              label: '药量(mg)',
              value: main.value?.dosage,
            },
            {
              key: 'aaaaaaaa',
              label: '加臭频率(次/天)',
              value: main.value?.frequency,
            },
            {
              key: 'aaaaaaaa',
              label: '监测周期(天)',
              value: main.value?.monitoringcycle,
            },
            {
              key: 'aaaaaaaa',
              label: '工作压力(Mpa)',
              value: main.value?.workpressure,
            },
            {
              key: 'aaaaaaaa',
              label: '储罐容积(L)',
              value: main.value?.tankvolume,
            },
          ],
        },
      ];
      break;

    case '6015':
      value = [
        {
          label: '本体信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '设备编号',
              value: main.value?.deviceCode,
            },
            {
              key: 'aaaaaaaa',
              label: '设备名称',
              value: main.value?.deviceName,
            },
            {
              key: 'aaaaaaaa',
              label: '通道名称',
              value: main.value?.easycvrChannelName,
            },
            {
              key: 'aaaaaaaa',
              label: '主机名称',
              value: main.value?.easycvrHostName,
            },
            {
              key: 'aaaaaaaa',
              label: '本机编号',
              value: main.value?.eqNumber,
            },
            {
              key: 'aaaaaaaa',
              label: '站场名称',
              value: main.value?.stationName,
            },
          ],
        },
        {
          label: '管理信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '管理人',
              value: main.value?.stationChargeName,
            },
            {
              key: 'aaaaaaaa',
              label: '联系电话',
              value: main.value?.stationChargePhone,
            },
            {
              key: 'aaaaaaaa',
              label: '安装地址',
              value: main.value?.address,
            },
          ],
        },
      ];
      break;

    default:
      break;
  }

  return value;
});

let originNetList;
async function getNetList() {
  await baseBuildingNetOrganizationListAll().then(res => {
    originNetList = res.data.data;
  });
}
getNetList();

function getAreaGroup(value) {
  if (value) {
    const id = value.split(',').pop();

    const item = originNetList.find(i => i.sid === id);
    const p = originNetList.find(i => i.sid === item.pid);

    const name = `${originNetList[0].netname}/${p.netname}/${item.netname}  ${item.netlevel}`;

    return name;
  }
}

// 存放调压箱气密性照片
const airPicture = ref([]);

async function getDetail() {
  const destroy = createLoading();
  let res;
  let insp;

  switch (typeValue) {
    case '5005':
      // 调压站
      res = await getTYZDetailByDataId(dataId);
      insp = await getTYZInspectInfoByCode(equipmentsyscode);
      insp.data.rows = insp.data.rows.map(item => ({
        ...item,
        patrolDate: item.practicalDate,
        patrolPerson: item.practicalPerson,
      }));
      break;

    case '6011':
      // 阴保站
      res = await getYBZDetailByDataId(dataId);
      break;

    case '5001':
      // 调压箱
      res = await getTYQDetailByDataId(dataId);
      // 添加调压箱气密性图片
      const r = await getFilePic(equipmentsyscode);
      airPicture.value = [];
      setTimeout(() => {
        airPicture.value = r.data.rows.sort((a, b) => a.type - b.type);
      });

      // 巡检数据
      insp = await getTYXInspectInfoByCode(equipmentsyscode);

      // 楼栋关系
      const br = await getBuildingRelation(equipmentsyscode);

      buildingRelation.value = br.data.rows;
      break;

    case '5010':
      // 阀门井
      res = await getFMJDetailByDataId(dataId);
      insp = await getFMJInspectInfoByCode(equipmentsyscode);
      break;

    case '6014':
      // 加臭设备
      res = await getJCSBDetailByDataId(dataId);
      break;

    case '6015':
      // 激光云台
      res = await getJGYTDetailByDataId(dataId);

      const data = res.data.data;
      data.dataid = data.id;
      data.equipmentcode = data.equipmentsyscode;

      const res2 = await getJGYTList();
      const rows = res2.data.rows;

      const v = rows.find(value => value.id === data.stationId);

      if (v) {
        data.stationChargeName = v.stationChargeName;
        data.stationChargePhone = v.stationChargePhone;
        data.stationName = v.stationName;
        data.address = JSON.parse(v.locationInfo).address;
      }

      // 获取激光云台维修记录
      const res3 = await getRepairList(equipmentsyscode);
      const rRows = res3.data.rows;
      data.equipmentMaintains = rRows;

      // 获取激光云台保养记录
      const res4 = await getHealthList(equipmentsyscode);
      const hRows = res4.data.rows;
      data.equipmentUpKeeps = hRows;

      break;

    default:
      break;
  }

  destroy();
  main.value = res.data.data;
  if (main.value?.equipmentMaintains?.length) {
    const old = main.value.equipmentMaintains;
    let newO = {};
    old.forEach(item => {
      if (newO[item.oddnumbers]) {
        newO[item.oddnumbers].push(item);
      } else {
        newO[item.oddnumbers] = [];
        newO[item.oddnumbers].push(item);
      }
    });

    main.value.equipmentMaintains = newO;
  } else {
    main.value.equipmentMaintains = void 0;
  }

  inspectList.value = insp?.data.rows.filter(item => item.patrolStatus != '0') || [];
}

getDetail(typeValue);

// 可以新增巡检：1 有对应巡检管理权限；2 有巡检任务
const canInspectCondition = ref(true);

const userStore = useUserStore();

let inspectPlanList = [];
async function processInspect() {
  console.log(typeValue);
  // 判断有没有巡检权限
  if (!userStore.menu.includes('safe')) {
    canInspectCondition.value = false;
    return;
  }

  // 判断有没有巡检任务(调压箱)（只是当月）
  if (typeValue === '5001') {
    const points = useMainData.getPointsByType('tyx');
    const index = points.findIndex(item => item.equipmentsyscode === equipmentsyscode);
    canInspectCondition.value = index !== -1;
    inspectPlanList = [points[0]];
  }

  // 判断有没有巡检任务(阀井)（只是当月）
  if (typeValue === '5010') {
    // 新的巡检
    const points = useMainData.getPointsByType('fj');

    const index = points.findIndex(item => item.equipmentsyscode === equipmentsyscode);
    canInspectCondition.value = index !== -1;
    inspectPlanList = [points[0]];
  }

  // 判断有没有巡检任务，就是是否已经巡检(调压站)
  if (typeValue === '5005') {
    const res = await service.get(`${config.url}/equipment/equipmentverify/basestationlistpatrol`);

    const item = res.data.rows.find(item => item.equipmentsyscode === equipmentsyscode);

    if (item.patrolstatus === '1') {
      canInspectCondition.value = false;
      return;
    }
  }
}

processInspect();

async function addInspect() {
  if (typeValue === '5005') {
    // 调压站巡检跳转
    localStorage.setItem('detailType', 'station');
    router.push(`/inspect/inspect-home?equipmentsyscode=${equipmentsyscode}`);
    setTimeout(() => {
      localStorage.removeItem('detailType');
    }, 300);
  } else if (canInspectCondition.value) {
    // 调压箱和阀井巡检跳转
    const addRecord = typeValue === '5001' ? api_regulator.addPost : api_well.addPost;
    const res = await addRecord(inspectPlanList[0]);
    const id = res.data.data;
    router.push(`/inspect/checking/${id}?type=${typeMap[typeValue]}&formType=edit`);
  }
}

// 维修
function addRepair() {
  // 传三个参数{equipmentcode, equipmenttype, equipmenttypeid}
  const eqcodeMap = {
    5005: 'RSU',
    5001: 'TYB',
    5010: 'FJ',
    6014: 'OET',
    6015: 'YGB',
  };
  router.push(
    `/device/repair?equipmentcode=${equipmentcode}&equipmenttype=${eqcodeMap[typeValue]}&equipmenttypeid=${typeValue}&equipment=${equipment}&equipmentsyscode=${equipmentsyscode}`
  );
}

// 保养
const healthRecord = ref();
const dingQiGrade = ref();

watch(healthRecord, value => {
  // console.log(value);
  dingQiGrade.value = 'one';
});
watch(dingQiGrade, value => {
  // console.log(value);
});

function healthTabChange(name) {
  console.log(name);
}

function addHealth() {
  if (['6014', '6015'].includes(typeValue)) {
    router.push(
      `/device/health?equipmentcode=${equipmentcode}&healthRecord=temp&dingQiGrade=${dingQiGrade.value}&typeValue=${typeValue}&normal=1&equipmentsyscode=${equipmentsyscode}`
    );
  } else if (typeValue !== '5010') {
    router.push(
      `/device/health?equipmentcode=${equipmentcode}&healthRecord=${healthRecord.value}&dingQiGrade=${dingQiGrade.value}&typeValue=${typeValue}&equipmentsyscode=${equipmentsyscode}`
    );
  } else {
    router.push(
      `/device/health-well?equipmentcode=${equipmentcode}&healthRecord=${healthRecord.value}&typeValue=${typeValue}&equipmentsyscode=${equipmentsyscode}`
    );
  }
}

// 保留状态
// useMyRouter('whole-set-detail-active', active);

function viewInfo(data) {
  router.push(`/device/info?sourceData=${JSON.stringify(data)}`);
}

function viewRepairInfo(data) {
  router.push(`/device/repair-info?sourceData=${JSON.stringify(data)}`);
}

// 调压箱添加气密性试验照片
function addPicture() {
  router.push(`/device/add-pic?equipmentsyscode=${equipmentsyscode}`);
}

function deletePic(id) {
  showConfirmDialog({
    title: '提示',
    message: '确定删除该张照片吗？',
  })
    .then(async () => {
      await delFilePic(id);
      showToast('操作成功');
      getDetail(typeValue);
    })
    .catch(() => {
      // on cancel
    });
}

function addBuilding() {
  router.push(
    `/device/add-building?equipmentsyscode=${equipmentsyscode}&equipmentcode=${equipmentcode}`
  );
}
</script>

<style lang="less" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  padding: 16px;
  background-color: rgba(245, 245, 245, 1);

  .title {
    height: 40px;
    font-size: 14px;
    color: #34394f;
    font-weight: 600;
  }

  .edit-btn {
    width: fit-content;
    height: 32px;
    border-radius: 30px;
    padding: 6px 20px;
    background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
    margin-bottom: 12px;
    margin-left: auto;

    font-size: 14px;
    color: #ffffff;
  }

  .content {
    width: 100%;
    height: 100%;
    border-radius: 16px;
    background-color: #fff;
    padding: 16px;

    &.can-edit {
      height: calc(100% - 44px);
    }

    .content-list {
      width: 100%;
      height: 100%;
      overflow-y: scroll;

      ul {
        .menu-title {
          position: relative;
          font-weight: 600;
          padding: 10px 0 10px 10px;

          &::before {
            content: ' ';
            display: inline-block;
            position: absolute;
            width: 5px;
            height: 15px;
            background-color: #1677ff;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
          }
        }

        > li {
          display: flex;
          align-items: center;
          height: 50px;
          font-size: 14px;
          color: #34394f;

          > div {
            flex: 1;

            // &:last-child {
            //   overflow-x: scroll;
            //   white-space: nowrap;
            // }
          }

          &.remarks {
            display: block !important;
            height: unset;
            line-height: 24px;

            > div:first-child {
              display: none;
            }
          }
        }
      }

      // 维修、保养记录
      .repair-item {
        padding: 12px;
        background: #c0e9e7;
        border-radius: 4px;
        box-shadow: inset 0px 4px 8vw 0px rgba(255, 255, 255, 0.3);
        font-family: 思源黑体;
        font-size: 12px;
        line-height: 16px;
        color: #17617e;
        // display: grid;
        // grid-template-columns: repeat(2, auto);
        // column-gap: 12px;
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  > .van-tabs {
    height: calc(100% - 40px);

    > :deep(.van-tabs__content) {
      height: calc(100% - 44px);
      padding-top: 16px;

      > .van-tab__panel {
        height: 100%;
      }
    }

    :deep(.van-tabs__nav--line) {
      box-sizing: content-box !important;
    }
  }
}

.health {
  height: 100%;

  &.can-edit {
    height: calc(100% - 44px);
  }

  :deep(.van-tabs__wrap) {
    margin-bottom: 16px;
  }

  :deep(.van-tabs__content) {
    height: calc(100% - 60px);

    .van-tab__panel {
      height: 100%;

      .van-tabs {
        height: 100%;
      }
    }

    :deep(.van-tabs__content) {
      height: calc(100% - 60px);
    }
  }
}

.content-list > div > span {
  display: flex;
  margin-bottom: 5px;

  &:last-child {
    margin-bottom: 0;
  }

  .title {
    height: unset;
    font-size: unset;
    color: unset;
    font-weight: unset;
    width: 100px;
  }

  .cont {
    flex: 1;
  }

  .cont-desc {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    -o-text-overflow: ellipsis;
  }
}

.pic-list {
  display: grid;
  row-gap: 12px;

  .pic-wrapper {
    // background-color: #c0e9e7;
    color: #34394f;

    .name {
      font-weight: 600;
      font-size: 14px;
    }

    img {
      display: inline-block;
      width: 100%;
      object-fit: contain;
    }
  }
}

.building-list {
  display: grid;
  row-gap: 12px;
  grid-template-rows: repeat(auto-fit, 40px);

  .building-wrapper {
    height: 40px;
    background-color: #c0e9e7;
    border-radius: 8px;
    padding: 0 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .name {
      color: #17617e;
      font-size: 12px;
    }
  }

  .van-empty {
    align-self: flex-start;
  }
}
</style>
