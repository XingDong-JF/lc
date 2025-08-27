<script setup>
import '../assets/css/goodsClassify.css';
import PopUp from './PopUp.vue';
import { goodsClassify } from '../apis/index.js';
import { ref, onMounted } from 'vue';

const categories = ref([]);
const showError = ref(false);

const fetchCategories = async () => {
    const result = await goodsClassify();
    if (!result) {
        showError.value = true;
    } else {
        categories.value = result;
    }
};

onMounted(() => {
    fetchCategories();
});
</script>

<template>
    <div class="goods-component">
        <PopUp v-if="showError" message="获取商品分类失败" />
        <div class="goods-component-top">
            <div class="gc-l">
                <div class="category-grid">
                    <!-- 待补充一级菜单的跳转 -->
                    <div v-for="item in categories" 
                         :key="item.cat_id"
                         class="category-item"
                         :data-cat-id="item.cat_id">
                        <img :src="item.cat_img" :alt="item.cat_name">
                        <p>{{ item.cat_name }}</p>
                        <!-- 待补充二级菜单显示 -->
                    </div>
                </div>
            </div>
            <div class="gc-r">
                <a href="javascript:void()">
                    <img src="https://image.iliangcang.com/ware/upload/orig/2/315/315574.jpg" alt="">
                    <p>新视线：&nbsp;2015年7月刊</p>
                </a>
            </div>
        </div>
        <div class="goods-component-bottom">
            <a href="javascript:void()"><span>查看所有品牌&nbsp;></span></a>
            <a href="javascript:void()"><span>最新到货&nbsp;></span></a>
        </div>
    </div>
</template>

<style scoped>

</style>
