<template>
  <van-calendar v-model:show="show2" @confirm="onConfirm" :min-date="minDate" />
</template>

<script setup>
import dayjs from 'dayjs';

const props = defineProps(['show', 'modelValue']);

const emit = defineEmits(['update:modelValue', 'update:show']);

const show2 = computed({
  get() {
    return props.show;
  },
  set() {
    emit('update:show', false);
  },
});

const minDate = dayjs().subtract(10, 'year').toDate();

const formatDate = date => `${date.getMonth() + 1}-${date.getDate()}`;
const onConfirm = value => {
  show2.value = false;
  emit('update:modelValue', dayjs(value).format('YYYY-MM-DD'));
};
</script>

<style lang="less" scoped></style>
