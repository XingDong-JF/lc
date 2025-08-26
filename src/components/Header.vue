<script setup>
import Message from './Message.vue';
import Cart from './Cart.vue';
import GoodsClassify from './GoodsClassify.vue';

import '../assets/css/header.css';

import { ref,onMounted  } from 'vue';

const username = ref('admin');
onMounted (() => {
    const user = localStorage.getItem('username');
    if (user) {
        username.value = user;
    }else{
        username.value = sessionStorage.getItem('username');
    }
});
</script>

<template>
    <div class="container-top">
        <div class="nav-top">
            <div class="nt-l">
                <router-link to="/home"></router-link>
            </div>
            <ul class="nt-r">
                <router-link>
                    <li>{{ username }}</li>
                </router-link>
                <span>|</span>
                <router-link class="cart-link">
                    <li>购物车</li>
                    <!-- 代补充：购物车组件数据渲染以及页面 -->
                    <Cart class="cart"></Cart> 
                </router-link>
                <span>|</span>
                <router-link class="message-link">
                    <li>消息</li>
                    <Message class="message"></Message>
                </router-link>
                <span>|</span>
                <router-link>
                    <li>添加良品</li>
                </router-link>
                <span>|</span>
                <router-link>
                    <li>资质证照&nbsp;/&nbsp;协议快照</li>
                </router-link>
            </ul>
        </div>
        <div class="nav-bottom">
            <ul class="nb-l">
                <router-link to="/home">
                    <li>首页</li>
                </router-link>
                <router-link class="goods-link">
                    <li>商店</li>
                    <GoodsClassify class="goods"></GoodsClassify>
                </router-link>
                <router-link>
                    <li>杂志</li>
                </router-link>
                <router-link>
                    <li>分享</li>
                </router-link>
                <router-link>
                    <li>达人</li>
                </router-link>
                <router-link>
                    <li>有偿咨询</li>
                </router-link>
            </ul>
            <!-- 待补充商品搜索 -->
            <div class="nb-r">
                <input type="text" placeholder="搜索商品/品牌/店铺">
                <span></span>
            </div>
        </div>
    </div>
</template>


<style scoped>

</style>