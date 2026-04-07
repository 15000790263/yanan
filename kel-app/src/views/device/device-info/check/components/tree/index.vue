<template>
  <div>
    <van-field
      v-model="field"
      is-link
      readonly
      label=""
      placeholder="请选择"
      @click="showTree = true"
    />
    <van-popup v-model:show="showTree" round position="bottom">
      <van-tree-select
        v-model:active-id="activeId"
        v-model:main-active-index="activeIndex"
        :items="items[0]?.children"
        @click-item="handleClickItem"
      >
      </van-tree-select>
    </van-popup>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: String,
  },
  fieldValue: {
    type: String,
    default: '',
  },
});

const field = computed(() => {
  return props.fieldValue;
});

const activeId = ref('');
const activeIndex = ref(-1);

const emit = defineEmits(['itemClick']);

const showTree = ref(false);

function handleClickItem(item) {
  showTree.value = false;
  emit('itemClick', item);
}
</script>

<style lang="less" scoped></style>
