<template>
  <div class="wrapper">
    <div class="list-wrapper">
      <div v-if="workStore.workUserRole.includes('0')" @click="handleClick('0')">作业计划填报</div>
      <div v-if="workStore.workUserRole.includes('1')" @click="handleClick('1')">作业计划审核</div>
      <div v-if="workStore.workUserRole.includes('5')" @click="handleClick('5')">作业票办理</div>
      <div v-if="workStore.workUserRole.includes('4')" @click="handleClick('4')">作业票审核</div>
      <div v-if="workStore.workUserRole.includes('3')" @click="handleClick('3')">作业查看</div>
    </div>
  </div>
</template>

<script setup>
import { useWorkStore } from '../../../stores/work/index';
import { clearUserRole, setUserRole } from '../../../utils/session';
import emitter from '@/utils/event-bus';
import { onMounted } from 'vue';

const workStore = useWorkStore();

const router = useRouter();

function handleClick(value) {
  switch (value) {
    case '1':
      setUserRole('1');
      router.push('/work/work-plan-approve');
      break;
    case '2':
      setUserRole('2');
      router.push('/work/work-plan-secure');
      break;
    case '3':
      setUserRole('3');
      router.push('/work/work-statistics');
      break;
    case '4':
      setUserRole('4');
      router.push('/work/work-ticket-approve');
      break;
    case '5':
      setUserRole('5');
      router.push('/work/work-ticket-manage');
      break;
    default:
      clearUserRole();
      router.push('/work/work-plan');
      break;
  }

  emitter.emit('workRouteChange');
}

onMounted(() => {
  clearUserRole();
  emitter.emit('workRouteChange');
});
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;
  padding: 16px;
  background-color: #f0f2f5;

  .list-wrapper {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    > div {
      width: 100%;
      height: 120px;
      color: #17617e;
      padding-top: 80px;
      text-align: center;
      background: url('/src/assets/image/work/icon-施工地.png') no-repeat center 20px/30%;
      background-color: #d4f2ef;
    }
  }
}
</style>
