<template>
  <div>
    <van-field
      v-model="fieldValue"
      is-link
      readonly
      label=""
      placeholder="请选择"
      @click="showPicker = true"
    />
    <van-popup v-model:show="showPicker" round position="bottom">
      <van-picker
        :columns="columns"
        :columns-field-names="{ text: 'dictLabel', value: 'dictValue' }"
        @cancel="showPicker = false"
        @confirm="onConfirm"
      />
    </van-popup>
  </div>
</template>

<script setup>
const props = defineProps({
  columnList: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: String,
  },
});

const emit = defineEmits(['update:modelValue']);

const fieldValue = ref('');
const showPicker = ref(false);

watchEffect(() => {
  if (props.modelValue && props.columnList.length) {
    fieldValue.value = props.columnList.find(item => item.dictValue === props.modelValue).dictLabel;
  }
});

const columns = computed(() => props.columnList);

const onConfirm = ({ selectedOptions }) => {
  showPicker.value = false;
  fieldValue.value = selectedOptions[0].dictLabel;
  emit('update:modelValue', selectedOptions[0].dictValue);
};
</script>

<style lang="less" scoped></style>
