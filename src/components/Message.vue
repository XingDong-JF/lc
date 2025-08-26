<template>
  <div class="notification-list">
    <ul>
      <li><span>动态</span><span>0</span></li>
      <li><span>评论</span><span>0</span></li>
      <li><span>私信</span><span>0</span></li>
      <li><span>粉丝</span><span>0</span></li>
      <li><span>喜欢</span><span>0</span></li>
      <li><span>通知</span><span>0</span></li>
    </ul>
  </div>
</template>

<script setup>
</script>

<style scoped>
.notification-list {
  width: 220px;
  border-top: 20px solid var(--theme-bg-color);
  background-color: #2c2f33;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  font-size: 12px;
  color: #e0e0e0;
  border-bottom: 1px solid #3a3e42;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

li:hover {
  background-color: #36393f; 
}

li:last-child {
  border-bottom: none;
}
</style>