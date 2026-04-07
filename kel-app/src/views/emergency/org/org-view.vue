<template>
  <App />
</template>

<script setup lang="jsx">
import { ref } from 'vue';
import { getEmergencyPost, getUserList } from '../../../api/emergency';

const userList = ref([]);

function App() {
  return (
    <div class="wrapper">
      {userList.value.map(item => (
        <div class="outer-type" key={item.groupName}>
          <div class="title">{item.groupName}</div>
          <ul>
            {item.children?.map(value => (
              <li class="member-item">
                <div class="name">{value.name}</div>
                <div class="level">{value.post}</div>
                <div class="phone">
                  <van-icon name="phone" />
                  <a href={`tel:${value.telephone}`}>{value.telephone}</a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

getUserList().then(async res => {
  const { data } = await getEmergencyPost();
  const arr = res.data.rows.map(item => {
    if (item.emergencyPost) {
      const obj = data.rows.find(value => value.dictValue === item.emergencyPost);
      return {
        ...item,
        post: obj.dictLabel,
      };
    } else {
      return item;
    }
  });
  userList.value = groupByKey(arr, 'groupId', 'groupName');
});

// 根据某个字段转为tree
function groupByKey(arr, key, name) {
  const a = [];
  let keyValue = '';
  let index = -1;
  arr.forEach(item => {
    if (item[key] !== keyValue) {
      keyValue = item[key];
      index++;
      a[index] = {};
      a[index].children = [];
      a[index][name] = item.groupName;
    }
    a[index].children.push(item);
  });
  return a;
}
</script>

<style lang="less" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  display: grid;
  gap: 16px;
  grid-auto-rows: max-content;

  ::v-deep {
    .outer-type {
      padding: 16px 24px;
      background-color: #fff;

      .title {
        height: 58px;
        font-family: 思源黑体;
        font-size: 16px;
        color: #34394f;
        display: flex;
        align-items: center;
        // position: sticky;
        // top: 0;
        // background-color: #fff;
      }

      ul {
        display: grid;
        gap: 8px;

        .member-item {
          height: 48px;
          padding: 0 16px;
          display: grid;
          grid-template-columns: 2fr 1fr 3fr;
          justify-items: end;
          align-items: center;
          border-bottom: 1px solid #e7eeee;

          font-family: Source Han Sans;
          font-size: 14px;
          font-variation-settings: 'opsz' auto;
          color: #34394f;

          .name,
          .level {
            justify-self: start;
          }
        }
      }
    }
  }
}
</style>
