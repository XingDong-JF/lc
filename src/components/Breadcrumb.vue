<script setup>
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  // 面包屑导航项目
  items: {
    type: Array,
    default: () => []
  }
});

const router = useRouter();

// 导航到指定路径
const navigate = (path) => {
  if (path) {
    router.push(path);
  }
};
</script>

<template>
  <div class="breadcrumb-container">
    <div class="breadcrumb">
      <span
        v-for="(item, index) in items"
        :key="index"
        class="breadcrumb-item"
      >
        <span 
          :class="{ 'clickable': item.path }" 
          @click="item.path ? navigate(item.path) : null"
        >
          {{ item.name }}
        </span>
        <span v-if="index < items.length - 1" class="separator">&gt;</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.breadcrumb-container {
  width: 1000px;
  margin: 0 auto;
  padding: 10px 0;
  margin-top: 120px;
}

.breadcrumb {
  font-size: 14px;
  color: #666;
}

.breadcrumb-item {
  display: inline-block;
  margin-right: 5px;
}

.clickable {
  color: #0c6eba;
  cursor: pointer;
}

.clickable:hover {
  text-decoration: underline;
}

.separator {
  margin-left: 5px;
  color: #999;
}
</style>
