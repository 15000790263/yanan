<template>
  <div class="wrapper">
    <div class="list">
      <template v-for="(item, index) in data" :key="index">
        <div class="item" @click="goDetail(item.data)">
          <div class="left">
            <span class="name">{{ item.name }}</span>
            <span class="time">{{ item.time }}</span>
          </div>
          <div class="mid">
            <div class="value">{{ item.level }}</div>
            <div class="line">检测</div>
          </div>
          <div class="right">
            <van-button round type="success" size="small">{{ item.status }}</van-button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const router = useRouter();
const data = JSON.parse(route.query.data);

function goDetail(value) {
  if (value.flag === 4) {
    return;
  }
  const paramsStr = JSON.stringify(value);
  router.push(`/alarm/detail?data=${paramsStr}`);
}
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;

  .list {
    display: grid;
    color: #34394f;
    padding: 12px 0;
    row-gap: 4px;
    height: 100%;
    overflow-y: scroll;
    grid-auto-rows: max-content;

    .item {
      height: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 12px;
      background-color: #fff;

      .left {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-direction: column;
        width: 60%;

        .name {
          font-size: 14px;
        }

        .time {
          font-size: 12px;
          color: #84abbb;
        }
      }

      .mid {
        font-size: 14px;
        display: flex;
        flex-direction: column;
        align-items: center;

        .value {
          font-size: 20px;
          font-weight: 900;
          color: #45aff8;
        }
      }
    }
  }
}
</style>
