<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCartStore } from '../stores/cartStore';
import { useRouter } from 'vue-router';

const cartStore = useCartStore();
const cartList = computed(() => cartStore.cartList);
const page = ref(1);
const pageSize = 4; // 每页显示4个商品
const router = useRouter();

const pagedList = computed(() => {
    const start = (page.value - 1) * pageSize;
    return cartList.value.slice(start, start + pageSize);
});

const totalPages = computed(() => {
    return Math.ceil(cartList.value.length / pageSize);
});

const goToCartPage = () => {
    router.push('/cart');
};

const fetchCartList = async () => {
    await cartStore.fetchCartList();
};

const prevPage = () => {
    if (page.value > 1) page.value--;
};
const nextPage = () => {
    if (page.value < totalPages.value) page.value++;
};

onMounted(() => {
    fetchCartList();
});
</script>

<template>
    <div class="headercart-container">
        <div v-if="cartList.length > 0" class="headercart-list">
            <div class="headercart-item" v-for="item in pagedList" :key="item.id" @click="goToCartPage">
                <img :src="item.goods_thumb" class="headercart-img" alt="商品图片">
                <div class="headercart-info">
                    <div class="headercart-name" title="{{ item.goods_name }}">{{ item.goods_name }}</div>
                    <div class="headercart-price">￥{{ item.price }}</div>
                </div>
            </div>
            <div class="headercart-pagination" v-if="totalPages > 1">
                <button @click.stop.prevent="prevPage" :disabled="page === 1">上一页</button>
                <span>{{ page }}/{{ totalPages }}</span>
                <button @click.stop.prevent="nextPage" :disabled="page === totalPages">下一页</button>
            </div>
        </div>
        <div v-else>
            <div class="headercart-list headercart-empty">
                <p>你的购物车暂时没有商品...</p>
            </div>
            <div class="headercart-page">
                <router-link to="/home">快去抢购良仓商品吧!</router-link>
            </div>
        </div>
    </div>
</template>

<style scoped>
.headercart-container {
    width: 320px;
    border-top: 20px solid var(--theme-bg-color);
}
.headercart-list {
    min-height: 80px;
    max-height: 320px;
    font-size: 12px;
    background-color: #2c2f33;
    color: #666;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 8px 0;
    text-align: left;
    letter-spacing: 2px;
}
.headercart-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 80px;
    font-size: 15px;
    text-align: center;
}
.headercart-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid #444;
    cursor: pointer;
    transition: background 0.2s;
}

.headercart-img {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 12px;
}
.headercart-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.headercart-name {
    font-size: 14px;
    color: #fff;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 140px;
}
.headercart-price {
    font-size: 13px;
    color: #7dbfde;
}
.headercart-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 8px 0;
}
.headercart-pagination button {
    background: #7dbfde;
    color: #fff;
    border: none;
    border-radius: 3px;
    padding: 2px 10px;
    margin: 0 8px;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.2s;
}
.headercart-pagination button:disabled {
    background: #b2d7ea;
    cursor: not-allowed;
}
.headercart-page {
    height: 50px;
    font-size: 14px;
    text-align: center;
    line-height: 50px;
    color: #fff;
    background-color: #7dbfde;
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
    cursor: pointer;
    letter-spacing: 2px;
}
</style>