<template>
  <div class="wrapper">
    <div class="list-wrapper">
      <van-cell-group inset>
        <template v-for="item in list">
          <div class="item">
            <van-field
              v-model="data[item.field]"
              placeholder=""
              type="textarea"
              rows="1"
              autosize
              colon
              readonly
              :label="item.title"
            >
              <template v-if="item.isFile" #input>
                <!-- 处理文件 -->
                <div
                  style="
                    width: 100%;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, 50px);
                    gap: 8px;
                  "
                >
                  <template
                    v-if="data[item.field]"
                    v-for="value in data[item.field].split(',')"
                    :key="value"
                  >
                    <div
                      style="color: #00f; text-decoration: underline; line-height: 40px"
                      @click="showImagePreview([config.fileUrlForPitfall + value])"
                    >
                      <img
                        style="width: 50px; height: 50px"
                        :src="config.fileUrlForPitfall + value"
                        alt=""
                      />
                    </div>
                  </template>
                </div>
              </template>
              <template v-if="item.field === 'STATE'" #input>
                <div v-if="data.STATE === '1'">待处理</div>
                <div v-if="data.STATE === '2'">处理中</div>
                <div v-if="data.STATE === '3'">作废</div>
                <div v-if="data.STATE === '4'">处理完成</div>
              </template>
              <template v-if="item.field === 'FAULTGRADE'" #input>
                <van-tag type="danger ">{{ data['FAULTGRADE'] }}</van-tag>
              </template>
            </van-field>
          </div>
        </template>
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import config from '../../../../config';
import { showImagePreview } from 'vant';

const route = useRoute();

const data = ref(JSON.parse(route.query.data));

const list = computed(() => {
  const l = [
    {
      key: 'aaaaaaa',
      title: '设备类型',
      field: 'EQUIPMENTTYPENAME',
    },
    {
      key: 'aaaaaaa',
      title: '隐患类型',
      field: 'FAULTTYPENAME',
    },
    {
      key: 'aaaaaaa',
      title: '隐患状态',
      field: 'STATE',
    },
    {
      key: 'aaaaaaa',
      title: '隐患等级',
      field: 'FAULTGRADE',
    },
    {
      key: 'aaaaaaa',
      title: '隐患地址',
      field: 'ADDRESS',
    },
    {
      key: 'aaaaaaa',
      title: '隐患描述',
      field: 'FAULTDESC',
    },
    {
      key: 'aaaaaaa',
      title: '发现时间',
      field: 'FINDDATE',
    },
    {
      key: 'aaaaaaa',
      title: '发现人',
      field: 'REPORTER',
    },
    {
      key: 'aaaaaaa',
      title: '发现部门',
      field: 'FINDDEPT',
    },
    {
      key: 'aaaaaaa',
      title: '发现时照片',
      field: 'FIRSTFILEPATH',
      isFile: true,
    },
    {
      key: 'aaaaaaa',
      title: '处理时间',
      field: 'MODIFYDATE',
    },
    {
      key: 'aaaaaaa',
      title: '处理人',
      field: 'MODIFIER',
    },
    {
      key: 'aaaaaaa',
      title: '处理部门',
      field: 'PROCESSDEPT',
    },
    {
      key: 'aaaaaaa',
      title: '处理完照片',
      field: 'LASTFILEPATH',
      isFile: true,
    },
  ];

  if (data.value.STATE === '1') {
    l.pop();
    l.pop();
    l.pop();
    l.pop();
  }

  return l;
});
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;
  padding: 14px;

  .list-wrapper {
    height: 100%;

    .van-cell-group {
      height: 100%;
      overflow-y: scroll;
      margin: 0;
    }
  }
}
</style>
