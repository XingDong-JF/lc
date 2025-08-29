<script setup>
import { hotGoods } from '../apis';
import { onMounted, ref } from 'vue';

const goodsList = ref([]);
const randomPage = ref(1);

const fetchGoods = async () => {
    let result = await hotGoods(randomPage.value, 4);
    if(result){
        goodsList.value = result;
    }
}
const refresh = () => {
    randomPage.value = Math.floor(Math.random() * 10) + 1;
    fetchGoods();
}
onMounted(() => {
    fetchGoods();
});
</script>
<template>
    <div class="gl">
        <div class="gl-p">
            <p>猜你喜欢</p>
            <span @click="refresh">换一批🗘</span>
        </div>
        <div class="gl-list">
            <div class="gl-item" v-for="(item, index) in goodsList" :key="item.goods_id">
                <router-link :to="{ name: 'Detail', params: { goodsId: item.goods_id }}">
                    <div class="gl-img">
                        <img :src="item.goods_thumb" :alt="item.goods_name" />
                    </div>
                </router-link>
                <p class="gl-name">{{ item.goods_name }}</p>
                <p class="gl-brand">{{ item.brand_name }}</p>
                <p class="gl-price">￥{{ item.price }}</p>
            </div>
        </div>
    </div>
</template>
<style scoped>
.gl {
    width: 200px;
    margin: 0 auto;
    background-color: #fff;
}

.gl-p {
    height: 20px;
    margin: 10px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.gl-p p {
    font-size: 14px;
    font-weight: 500;
}

.gl-p span {
    font-size: 14px;
    cursor: pointer;
    color: #3193F3;
}
.gl-list{
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: space-between;
}
.gl-img>img{
    width: 200px;
    height: 200px;
    object-fit: cover;
}
.gl-name, .gl-brand, .gl-price{
    margin-top: 4px;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
}
.gl-brand{
    color: rgb(153, 153, 153);
}
.gl-price{
    color: #3193F3;
    font-size: 14px
}
</style>
