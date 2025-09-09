<script setup>
import '../assets/css/hotGoods.css';

import { hotGoods } from '../apis/index.js';
import { onMounted, ref } from 'vue';

import PopUp from './PopUp.vue';

const hotList = ref([]);
const showGoods = ref(false);
const currentPage = ref(3);

const fetchHotGoods = async (page, pageSize) => {
    const result = await hotGoods(page, pageSize);
    if (!result) {
        showGoods.value = true;
    } else {
        showGoods.value = false;
        // 为每个商品添加一个本地的like状态
        const processedResult = result.map(item => ({
            ...item,
            isLike: false
        }));
        hotList.value = hotList.value.concat(processedResult);
    }
};

const addGoodsList = () => {
    currentPage.value += 1;
    fetchHotGoods(currentPage.value, 3);
};
// 处理点赞事件，防止冒泡
const changeLike = (event, index) => {
    event.preventDefault(); // 阻止默认行为
    event.stopPropagation(); // 阻止事件冒泡
    hotList.value[index].isLike = !hotList.value[index].isLike;
};

onMounted(() => {
    fetchHotGoods(1, 9);
});

</script>
<template>
    <PopUp v-if="showGoods" message="获取热门商品失败" />
    <div class="ht-title">
        <span>人气良品</span>
    </div>
    <div class="ht">
        <div v-for="(item, index) in hotList" :key="item.goods_id" class="ht-goods-wrapper">
            <router-link :to="{ name: 'Detail', params: { goodsId: item.goods_id }}" >
                <div class="ht-goods">
                    <div class="htg-img">
                        <img :src="item.goods_thumb" :alt="item.goods_name">
                        <div class="htg-hover">
                            <div class="htgh-price">
                                <span>￥{{ item.price }}</span>
                            </div>
                            <div class="htgh-title">
                                <p class="p-first">{{ item.goods_name }}</p>
                                <p class="p-second">{{ item.goods_desc }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="htg-name">
                        <div class="htgn-l">
                            <img :src="item.brand_thumb" :alt="item.brand_name">
                            <p>{{ item.brand_name }}</p>
                        </div>
                        <div class="htgn-r">
                            <span class="number">{{ item.goods_number }}</span>
                            <span class="like-btn" @click="changeLike($event, index)">{{item.isLike ? '💖' : '🤍'}}</span>
                        </div>
                    </div>
                </div>
            </router-link>
        </div>
    </div>
    <div class="ht-btu" @click="addGoodsList()">
    </div>
</template>
<style scoped>
.ht-goods-wrapper {
    display: contents; 
}
.like-btn {
    cursor: pointer;
    user-select: none;
}
</style>
