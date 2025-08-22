<script setup>
import { defineProps } from 'vue';

// 定义接收的属性
const props = defineProps({
  message: {
    type: String,
    required: true
  }
});
</script>

<template>
  <div class="popup">
    <p>{{ message }}</p>
  </div>
</template>

<style scoped>
.popup {
  max-width: 280px;
  height: 60px;
  font-size: 14px;
  text-align: center;
  line-height: 60px;
  padding: 0 12px;
  background-color: #f56c6c;
  color: #ffffff;
  border-color: #f56c6c;
  border-radius: 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  position: absolute;
  top: -240px;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: popup 2.6s ease-in-out;
  z-index: 9999; 
}

@keyframes popup {
  0% {
    top: -240px;
  }
  20% {
    top: 50%;
  }
  80% {
    top: 50%;
  }
  100% {
    top: -240px;
  }
}
</style>