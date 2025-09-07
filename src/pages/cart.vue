<script setup>
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import GoTop from '../components/GoTop.vue';
import MenuPop from '../components/MenuPop.vue';
import PopUp from '../components/PopUp.vue';
import "../assets/css/cart.css";
import { getCartList, deleteCartItem } from '../apis';
import { ref, onMounted,watch,computed } from 'vue';
import { useCartStore } from '../stores/cartStore';

const isPay = ref(true);
const showCartList = ref(false);
const cartStore = useCartStore();
const cartList = computed(() => cartStore.cartList);

// 选中商品总价，响应式
const totalPrice = computed(() => {
    if (!selectedItems.value.length || !cartList.value.length) return 0;
    let sum = 0;
    selectedItems.value.forEach(sel => {
        const item = cartList.value.find(c => c.goods_id === sel.goodsId);
        if (item) {
            sum += Number(item.price) * Number(sel.goods_number);
        }
    });
    return sum;
});
// 选中商品数组，初始全选
const selectedItems = ref([]); // 待补充：将选中的商品通过api提交到结算清单

// 计算全选状态
const isAllChecked = ref(true);

// 监听cartList变化，初始化全选
watch(cartList, (newList) => {
    if (newList && newList.length > 0) {
        selectedItems.value = newList.map(item => ({ goodsId: item.goods_id, goods_number: item.goods_number }));
        isAllChecked.value = true;
    } else {
        selectedItems.value = [];
        isAllChecked.value = false;
    }
}, { immediate: true });

// 处理单个商品选中/取消
const handleItemCheck = (item, checked) => {
    if (checked) {
        // 添加到选中数组
        if (!selectedItems.value.some(i => i.goodsId === item.goods_id)) {
            selectedItems.value.push({ goodsId: item.goods_id, goods_number: item.goods_number });
        }
    } else {
        // 从选中数组移除
        selectedItems.value = selectedItems.value.filter(i => i.goodsId !== item.goods_id);
    }
    // 判断是否全选
    isAllChecked.value = selectedItems.value.length === cartList.value.length;
};

// 处理全选按钮
const handleCheckAll = (checked) => {
    isAllChecked.value = checked;
    if (checked) {
        selectedItems.value = cartList.value.map(item => ({ goodsId: item.goods_id, goods_number: item.goods_number }));
    } else {
        selectedItems.value = [];
    }
};
const goToCart = () => {
    isPay.value = true;
    fetchCartList();
}

// 删除购物车商品
const deleteCart = async (goodsId) => {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    const res = await deleteCartItem(userId, goodsId);
    if (res) {
        // 删除成功后刷新购物车列表，使用pinia
        await cartStore.fetchCartList();
    } else {
        // 可选：弹窗提示删除失败
        showCartList.value = true;
    }
};
const goToPay = () => {
    isPay.value = false;
}
const fetchCartList = async () => {
    await cartStore.fetchCartList();
    if (!cartStore.cartList.length) {
        showCartList.value = true;
    }
}
onMounted(() => {
    fetchCartList();
});
</script>
<template>
    <div class="cart-page">
        <div class="cart-page-title">
            <p @click="goToCart" :style="{ color: isPay ? '#3e89d9' : '#666' }">购物车</p>
            <span>|</span>
            <p @click="goToPay" :style="{ color: !isPay ? '#3e89d9' : '#666' }">付款</p>
        </div>
        <div v-if="isPay" class="cart-page-shop">
            <div v-if="cartList.length > 0">
                <table>
                    <thead>
                            <th class="checkall">
                                <input type="checkbox" id="checkall" :checked="isAllChecked" @change="handleCheckAll($event.target.checked)">
                                <label for="checkall">全选</label>
                            </th>
                        <th>良品</th>
                        <th>数量</th>
                        <th>单价（元）</th>
                        <th>小计（元）</th>
                        <th>操作</th>
                    </thead>
                    <tbody>
                        <tr v-for="value in cartList" :key="value.id">
                            <td>
                                    <label>
                                        <input type="checkbox"
                                            :id="value.id"
                                            :checked="selectedItems.some(i => i.goodsId === value.goods_id)"
                                            @change="handleItemCheck(value, $event.target.checked)"
                                        >
                                        <img :src="value.goods_thumb">
                                    </label>
                            </td>
                            <td><span>{{ value.goods_name }}</span></td>
                            <td><span>{{ value.goods_number }}</span></td>
                            <td>{{ value.price }}</td>
                            <td>{{ value.price * Number(value.goods_number) }}</td>
                            <td><button @click="deleteCart(value.goods_id)">删除</button></td>
                        </tr>
                    </tbody>
                </table>
                <div class="cps-bottom">
                    <div class="cpsb-price">
                        良品总价：<span>￥{{ totalPrice }}</span>
                    </div>
                    <div class="cpsb-pay" @click="goToPay">立即结算</div>
                    <router-link to="/home">继续购物</router-link>
                </div>
            </div>
            <div v-else class="cart-empty">
                <router-link to="/home">购物车空空如也~~去购物吧!</router-link>
            </div>
        </div>
        <div v-else class="cart-page-pay">

        </div>
    </div>
    <Header></Header>
    <MenuPop></MenuPop>
    <GoTop></GoTop>
    <PopUp v-if="showCartList" message="获取购物车清单失败！"></PopUp>
    <Footer></Footer>
</template>
<style scoped>
.cart-page-shop{
    min-height: 518px;
}
</style>
