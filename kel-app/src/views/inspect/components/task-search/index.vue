<script setup>
import { ref, computed, watch } from 'vue';
import icon_search from '../../../../assets/image/check/icon-search.png';

const props = defineProps({
  placeholder: {
    type: String,
    default: '请输入设备编号',
  },
});
const emit = defineEmits(['onSearch', 'onSearchClear']);

const value = ref('');

const handleSearch = () => {
  emit('onSearch', value.value);
};

const isKeyWordNotEmpty = computed(() => {
  return value.value !== '';
});

watch(isKeyWordNotEmpty, newVal => {
  if (newVal === false) {
    // 变成空
    emit('onSearchClear');
  }
});

const handleClear = () => {
  value.value = '';
  emit('onSearchClear');
};
</script>

<template>
  <div class="search-container">
    <div class="input-container">
      <!-- <img :src="icon_search" width="16" height="16" /> -->
      <input v-model.trim="value" :placeholder="props.placeholder" />
      <div v-if="isKeyWordNotEmpty" class="clear" @click="handleClear">
        <van-icon name="close" />
      </div>
    </div>

    <van-divider vertical :style="{ borderColor: '#84ABBB' }" />
    <div class="text" @click="handleSearch">搜索</div>
  </div>
</template>

<style lang="less" scoped>
@placeHolderColor: #84abbb;
.search-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 30px;
  border-radius: 30px;
  opacity: 1;
  box-sizing: border-box;
  border: 1px solid #bbcece;

  .input-container {
    width: 75%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    .clear {
      position: absolute;
      right: 4px;
      top: 1px;
      color: #84abbb;
    }
    input {
      width: 100%;
      margin-left: 10px;
      border: none;
      color: #84abbb;
      background-color: transparent;
    }

    input::placeholder {
      color: @placeHolderColor;
    }

    input::-webkit-input-placeholder {
      color: @placeHolderColor;
    }

    input:-moz-placeholder {
      color: @placeHolderColor;
      opacity: 1;
    }

    input::-moz-placeholder {
      color: @placeHolderColor;
      opacity: 1;
    }

    input:-ms-input-placeholder {
      color: @placeHolderColor;
    }
  }

  .text {
    color: #00b099;
    font-size: 14px;
  }
}
</style>
