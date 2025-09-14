<script setup>
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import GoTop from '../components/GoTop.vue';
import MenuPop from '../components/MenuPop.vue';
import PopUp from '../components/PopUp.vue';
import OurShop from '../components/OurShop.vue';
import "../assets/css/cart.css";
import { getCartList, deleteCartItem, getProvinces, getCities, getDistricts, addAress, getAddressList, deleteAddress, clearCart, setDefaultAddress, setCurrentAddress, addToOrder, getOrderList, payOrder } from '../apis';
import { ref, onMounted,watch,computed } from 'vue';
import { useCartStore } from '../stores/cartStore';
import { ElMessage, ElMessageBox } from 'element-plus';

const isPay = ref(true);
const showCartList = ref(false);
const cartStore = useCartStore();
const cartList = computed(() => cartStore.cartList);

// 新增地址表单数据
const addressForm = ref({
    takename: '',      // 收货人姓名
    province: '',      // 省份
    city: '',          // 城市
    district: '',      // 区县
    streetname: '',    // 详细地址
    tel: '',          // 手机号码
    postcode: ''      // 邮政编码（从选择的区县数据中获取code）
});

// 地址选择器数据
const provinces = ref([]);
const cities = ref([]);
const districts = ref([]);

// 地址列表数据
const addressList = ref([]);

// 选中的地址
const selectedAddress = ref(null);

// 结算清单数据
const orderList = ref([]);

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

// 当前选中地址的简要信息
const selectedAddressInfo = computed(() => {
    if (!selectedAddress.value) return '请选择收货地址';
    const addr = selectedAddress.value;
    return `${addr.takename} ${addr.tel} ${addr.province} ${addr.district} ${addr.streetname}`;
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

// 监听选中地址变化
watch(selectedAddress, (newAddress, oldAddress) => {
    
}, { deep: true });

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
        // 从选中数组中移除已删除的商品
        selectedItems.value = selectedItems.value.filter(item => item.goodsId !== goodsId);
        // 重新判断全选状态
        isAllChecked.value = cartList.value.length > 0 && selectedItems.value.length === cartList.value.length;
    } else {
        // 可选：弹窗提示删除失败
        showCartList.value = true;
    }
};
const goToPay = async () => {
    // 检查是否有选中的商品
    if (selectedItems.value.length === 0) {
        ElMessage.warning('请先选择要结算的商品');
        return;
    }
    
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (!userId) {
        ElMessage.error('请先登录');
        return;
    }
    
    try {
        // 将选中的商品ID用&符连接
        const goodsIds = selectedItems.value.map(item => item.goodsId).join('&');
        
        // 提交到结算清单
        const res = await addToOrder(userId, goodsIds);
        
        if (res) {
            // 成功后获取结算清单数据
            await fetchOrderList();
            // 切换到支付页面
            isPay.value = false;
            ElMessage.success('商品已加入结算清单');
        } else {
            ElMessage.error('加入结算清单失败，请重试');
        }
    } catch (error) {
        console.error('提交结算清单时发生错误:', error);
        ElMessage.error('网络错误，请重试');
    }
}
const fetchCartList = async () => {
    await cartStore.fetchCartList();
    if (!cartStore.cartList.length) {
        showCartList.value = true;
    }
}

// 获取省份数据
const fetchProvinces = async () => {
    try {
        const res = await getProvinces();
        if (res && Array.isArray(res) && res.length > 0) {
            provinces.value = res;
        } else {
            console.error('获取省份数据失败或数据为空:', res);
        }
    } catch (error) {
        console.error('获取省份数据时发生错误:', error);
    }
}

// 获取地址列表
const fetchAddressList = async () => {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (!userId) {
        console.error('用户未登录');
        return;
    }
    
    try {
        const res = await getAddressList(userId);
        if (res && Array.isArray(res)) {
            addressList.value = res;
            
            // 维护当前选中的地址状态
            const currentSelectedId = selectedAddress.value?.address_id;
            
            // 查找激活地址和默认地址
            const activeAddress = res.find(addr => addr.isActive === true);
            const defaultAddress = res.find(addr => addr.isDefault === true);
            
            // 优先级：保持当前选中 > 激活地址 > 默认地址 > 第一个地址
            if (currentSelectedId) {
                const currentAddress = res.find(addr => addr.address_id === currentSelectedId);
                if (currentAddress) {
                    selectedAddress.value = currentAddress;
                } else if (activeAddress) {
                    selectedAddress.value = activeAddress;
                } else if (defaultAddress) {
                    selectedAddress.value = defaultAddress;
                } else if (res.length > 0) {
                    selectedAddress.value = res[0];
                }
            } else {
                // 如果没有当前选中地址，按优先级选择
                if (activeAddress) {
                    selectedAddress.value = activeAddress;
                } else if (defaultAddress) {
                    selectedAddress.value = defaultAddress;
                } else if (res.length > 0) {
                    selectedAddress.value = res[0];
                }
            }
        } else {
            console.error('获取地址列表失败或数据为空:', res);
            addressList.value = [];
            selectedAddress.value = null;
        }
    } catch (error) {
        console.error('获取地址列表时发生错误:', error);
        addressList.value = [];
        selectedAddress.value = null;
    }
}

// 选择地址
const selectAddress = async (address) => {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (!userId) {
        console.error('用户未登录');
        ElMessage.error('请先登录');
        return;
    }
    
    // 如果选择的是当前已选中的地址，不需要重复设置
    if (selectedAddress.value && selectedAddress.value.address_id === address.address_id) {
        return;
    }
    
    try {
        const res = await setCurrentAddress(userId, address.address_id);
        
        if (res) {
            // 先更新选中状态，提供即时反馈
            selectedAddress.value = address;
            ElMessage.success(`已切换到地址: ${address.takename}`);
            
            // 然后刷新地址列表以更新所有地址的isActive状态
            await fetchAddressList();
        } else {
            ElMessage.error('设置当前地址失败，请重试');
        }
    } catch (error) {
        console.error('设置当前地址时发生错误:', error);
        ElMessage.error('网络错误，设置当前地址失败');
    }
}

// 清空表单
const clearAddressForm = () => {
    addressForm.value = {
        takename: '',
        province: '',
        city: '',
        district: '',
        streetname: '',
        tel: '',
        postcode: ''
    };
    // 清空选择器数据
    cities.value = [];
    districts.value = [];
}

// 省份选择改变时，获取城市数据
const onProvinceChange = async () => {
    // 清空城市和区县选择
    addressForm.value.city = '';
    addressForm.value.district = '';
    cities.value = [];
    districts.value = [];
    
    if (addressForm.value.province) {
        const res = await getCities(addressForm.value.province);
        if (res) {
            cities.value = res;
        }
    }
}

// 城市选择改变时，获取区县数据
const onCityChange = async () => {
    // 清空区县选择
    addressForm.value.district = '';
    districts.value = [];
    
    if (addressForm.value.city) {
        const res = await getDistricts(addressForm.value.province, addressForm.value.city);
        if (res && res.area) {
            districts.value = res.area;
        }
    }
}

// 区县选择改变时，保存code到邮政编码字段
const onDistrictChange = () => {
    if (addressForm.value.district) {
        const selectedDistrict = districts.value.find(item => item.name === addressForm.value.district);
        if (selectedDistrict) {
            addressForm.value.postcode = selectedDistrict.code;
        }
    }
}

// 新增地址
const addNewAddress = async () => {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (!userId) {
        console.error('用户未登录');
        return;
    }
    
    // 表单验证
    if (!addressForm.value.takename || !addressForm.value.province || !addressForm.value.city || 
        !addressForm.value.district || !addressForm.value.streetname || !addressForm.value.tel) {
        ElMessage.warning('请填写完整的地址信息');
        return;
    }
    
    try {
        const res = await addAress(
            'addAddress',
            userId,
            addressForm.value.province,
            addressForm.value.city,
            addressForm.value.district,
            addressForm.value.streetname,
            addressForm.value.takename,
            addressForm.value.postcode,
            addressForm.value.tel
        );
        
        if (res) {
            // 新增成功后刷新地址列表
            await fetchAddressList();
            // 清空表单
            clearAddressForm();
            ElMessage.success('地址添加成功！');
        } else {
            ElMessage.error('地址添加失败，请重试！');
        }
    } catch (error) {
        console.error('新增地址时发生错误:', error);
        ElMessage.error('地址添加失败，请重试！');
    }
}

// 删除地址
const deleteAddressItem = async (addressId) => {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (!userId) {
        console.error('用户未登录');
        return;
    }
    
    try {
        // 确认删除
        await ElMessageBox.confirm(
            '确定要删除这个地址吗？',
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );
        
        const res = await deleteAddress(userId, addressId);
        
        if (res) {
            // 删除成功后刷新地址列表
            await fetchAddressList();
            // 如果删除的是当前选中的地址，清空选中状态
            if (selectedAddress.value && selectedAddress.value.address_id === addressId) {
                selectedAddress.value = null;
            }
            ElMessage.success('地址删除成功！');
        } else {
            ElMessage.error('地址删除失败，请重试！');
        }
    } catch (error) {
        if (error === 'cancel') {
            // 用户取消删除，不显示错误信息
            return;
        }
        console.error('删除地址时发生错误:', error);
        ElMessage.error('地址删除失败，请重试！');
    }
}

// 设置默认地址
const setAsDefaultAddress = async (addressId) => {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (!userId) {
        console.error('用户未登录');
        return;
    }
    
    try {
        const res = await setDefaultAddress(userId, addressId);
        
        if (res) {
            // 设置成功后刷新地址列表
            await fetchAddressList();
            ElMessage.success('默认地址设置成功！');
        } else {
            ElMessage.error('设置默认地址失败，请重试！');
        }
    } catch (error) {
        console.error('设置默认地址时发生错误:', error);
        ElMessage.error('设置默认地址失败，请重试！');
    }
}
// 清空购物车
const clearCartAll = async () => {
    try {
        // 确认清空
        await ElMessageBox.confirm(
            '确定要清空购物车吗？',
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );
        
        const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
        if (!userId) {
            console.error('用户未登录');
            return;
        }
        
        const res = await clearCart(userId);
        
        if (res) {
            // 清空成功后刷新购物车列表
            await cartStore.fetchCartList();
            // 清空选中状态
            selectedItems.value = [];
            isAllChecked.value = false;
            ElMessage.success('购物车已清空！');
        } else {
            ElMessage.error('清空购物车失败，请重试！');
        }
    } catch (error) {
        if (error === 'cancel') {
            // 用户取消清空，不显示错误信息
            return;
        }
        console.error('清空购物车时发生错误:', error);
        ElMessage.error('清空购物车失败，请重试！');
    }
}

// 获取结算清单
const fetchOrderList = async () => {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (!userId) {
        console.error('用户未登录');
        return;
    }
    
    try {
        const res = await getOrderList(userId);
        if (res) {
            orderList.value = res;
        } else {
            console.error('获取结算清单失败');
            orderList.value = [];
        }
    } catch (error) {
        console.error('获取结算清单时发生错误:', error);
        orderList.value = [];
    }
}

// 立即支付功能
const handlePayment = async () => {
    // 检查是否选择了收货地址
    if (!selectedAddress.value) {
        ElMessage.warning('请先选择收货地址');
        return;
    }
    
    // 检查是否有订单商品
    if (!orderList.value || orderList.value.length === 0) {
        ElMessage.warning('订单为空，无法支付');
        return;
    }
    
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (!userId) {
        ElMessage.error('请先登录');
        return;
    }
    
    try {
        // 计算总金额
        const totalAmount = orderList.value.reduce((sum, item) => sum + (item.price * Number(item.goods_number)), 0);
        
        // 生成订单标题（商品名称列表，超过3个商品时简化显示）
        let subject = '';
        if (orderList.value.length === 1) {
            subject = orderList.value[0].goods_name;
        } else if (orderList.value.length <= 3) {
            subject = orderList.value.map(item => item.goods_name).join('、');
        } else {
            subject = `${orderList.value[0].goods_name}等${orderList.value.length}件商品`;
        }
        
        // 生成订单详情
        const body = orderList.value.map(item => 
            `${item.goods_name} x${item.goods_number}`
        ).join('；');
        
        // 支付返回地址
        const returnUrl = 'http://localhost:5173/payment';
        
        // 生成订单ID（使用第一个商品的_id或时间戳）
        const orderId = orderList.value[0]._id || Date.now().toString();
        
        ElMessage.info('正在跳转到支付页面...');
        
        // 调用支付API
        const paymentRes = await payOrder(userId, orderId, returnUrl, totalAmount, subject, body);
        
        if (paymentRes && paymentRes.data) {
            // 自动跳转到支付宝支付页面
            window.location.href = paymentRes.data;
        } else {
            ElMessage.error('获取支付链接失败，请重试');
        }
    } catch (error) {
        console.error('支付时发生错误:', error);
        ElMessage.error('支付失败，请重试');
    }
}

onMounted(() => {
    fetchCartList();
    fetchProvinces(); // 获取省份数据
    fetchAddressList(); // 获取地址列表
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
                <div class="cart-actions">
                    <button class="clear-cart-btn" @click="clearCartAll">清空购物车</button>
                </div>
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
            <div class="cpp-address">
                <div class="cppa-title">
                    <p>收货地址</p>
                </div>
                <div class="cppa-addressList">
                    <div v-if="addressList.length > 0" class="address-list-container">
                        <div class="address-list-wrapper">
                            <div 
                                v-for="address in addressList" 
                                :key="address.address_id"
                                :class="[
                                    'address-card', 
                                    { 
                                        'selected': selectedAddress && selectedAddress.address_id === address.address_id,
                                        'active': address.isActive
                                    }
                                ]"
                                @click="selectAddress(address)"
                            >
                                <div class="address-card-header">
                                    <div class="address-info">
                                        <span class="address-name">{{ address.takename }}</span>
                                        <span class="address-phone">{{ address.tel }}</span>
                                        <span v-if="address.isDefault" class="default-tag">默认地址</span>
                                    </div>
                                    <div class="address-actions">
                                        <button 
                                            v-if="!address.isDefault" 
                                            class="default-btn" 
                                            @click.stop="setAsDefaultAddress(address.address_id)"
                                        >
                                            设为默认
                                        </button>
                                        <button class="delete-btn" @click.stop="deleteAddressItem(address.address_id)">删除</button>
                                    </div>
                                </div>
                                <div class="address-card-body">
                                    <p class="address-detail">
                                        {{ address.province }} {{ address.district }} {{ address.streetname }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="no-address">
                        <p>暂无收货地址，请添加新地址</p>
                    </div>
                </div>
                <div class="cppa-newAddress">
                    <h3>新增收货地址</h3>
                    <div class="address-form">
                        <div class="form-row">
                            <label>收货人姓名：</label>
                            <input 
                                type="text" 
                                v-model="addressForm.takename" 
                                placeholder="请输入收货人姓名"
                                class="form-input"
                            >
                        </div>
                        
                        <div class="form-row">
                            <label>所在地区：</label>
                            <div class="select-group">
                                <select 
                                    v-model="addressForm.province" 
                                    @change="onProvinceChange"
                                    class="form-select"
                                >
                                    <option value="">请选择省份</option>
                                    <option 
                                        v-for="province in provinces" 
                                        :key="province.code" 
                                        :value="province.name"
                                    >
                                        {{ province.name }}
                                    </option>
                                </select>
                                
                                <select 
                                    v-model="addressForm.city" 
                                    @change="onCityChange"
                                    :disabled="!addressForm.province"
                                    class="form-select"
                                >
                                    <option value="">请选择城市</option>
                                    <option 
                                        v-for="city in cities" 
                                        :key="city.code" 
                                        :value="city.name"
                                    >
                                        {{ city.name }}
                                    </option>
                                </select>
                                
                                <select 
                                    v-model="addressForm.district" 
                                    @change="onDistrictChange"
                                    :disabled="!addressForm.city"
                                    class="form-select"
                                >
                                    <option value="">请选择区县</option>
                                    <option 
                                        v-for="district in districts" 
                                        :key="district.code" 
                                        :value="district.name"
                                    >
                                        {{ district.name }}
                                    </option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <label>详细地址：</label>
                            <input 
                                type="text" 
                                v-model="addressForm.streetname" 
                                placeholder="请输入详细地址"
                                class="form-input"
                            >
                        </div>
                        
                        <div class="form-row">
                            <label>手机号码：</label>
                            <input 
                                type="tel" 
                                v-model="addressForm.tel" 
                                placeholder="请输入手机号码"
                                class="form-input"
                            >
                        </div>
                        
                        <div class="form-row">
                            <button class="add-address-btn" @click="addNewAddress">新增地址</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="cpp-orderList">
                <div class="cppo-title">
                    <p>订单详情</p>
                </div>
                <div v-if="orderList.length > 0" class="order-list-container">
                    <table class="order-table">
                        <thead>
                            <tr>
                                <th>商品</th>
                                <th>描述</th>
                                <th>数量</th>
                                <th>价格（元）</th>
                                <th>小计（元）</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in orderList" :key="item._id">
                                <td>
                                    <div class="order-goods">
                                        <img :src="item.goods_thumb" :alt="item.goods_name">
                                        <span class="goods-name">{{ item.goods_name }}</span>
                                    </div>
                                </td>
                                <td>
                                    <p class="goods-desc">{{ item.goods_desc }}</p>
                                </td>
                                <td>{{ item.goods_number }}</td>
                                <td>￥{{ item.price }}</td>
                                <td>￥{{ item.price * Number(item.goods_number) }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="order-summary">
                        <div class="total-price">
                            <span class="label">订单总价：</span>
                            <span class="price">￥{{ orderList.reduce((sum, item) => sum + (item.price * Number(item.goods_number)), 0) }}</span>
                        </div>
                        <div class="order-actions">
                            <button class="pay-btn" @click="handlePayment">立即支付</button>
                            <button class="back-btn" @click="goToCart">返回购物车</button>
                        </div>
                    </div>
                </div>
                <div v-else class="no-order">
                    <p>暂无订单信息</p>
                    <button class="back-btn" @click="goToCart">返回购物车</button>
                </div>
            </div>
        </div>
    </div>
    <Header></Header>
    <MenuPop></MenuPop>
    <GoTop></GoTop>
    <OurShop></OurShop>
    <PopUp v-if="showCartList" message="获取购物车清单失败！"></PopUp>
    <Footer></Footer>
</template>
<style scoped>
</style>
